//! SysInfoService — system information gathering.

use std::process::Command;

pub struct SysInfoService;

impl SysInfoService {
    pub fn get_system_info() -> serde_json::Value {
        let mut sysinfo = serde_json::Map::new();

        sysinfo.insert(
            "os".to_string(),
            serde_json::json!({
                "platform": std::env::consts::OS,
                "arch": std::env::consts::ARCH,
                "family": std::env::consts::FAMILY,
            }),
        );

        sysinfo.insert("memory".to_string(), Self::get_memory_info());
        sysinfo.insert("cpu".to_string(), Self::get_cpu_info());
        sysinfo.insert("disk".to_string(), Self::get_disk_info());
        sysinfo.insert("uptime".to_string(), serde_json::json!(Self::get_uptime()));
        sysinfo.insert(
            "env_vars".to_string(),
            serde_json::json!(std::env::vars_os().count()),
        );

        let current_dir = std::env::current_dir()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string());
        sysinfo.insert("cwd".to_string(), serde_json::json!(current_dir));

        serde_json::Value::Object(sysinfo)
    }

    fn get_memory_info() -> serde_json::Value {
        let mut mem = serde_json::Map::new();
        if let Ok(content) = std::fs::read_to_string("/proc/meminfo") {
            for line in content.lines() {
                let parts: Vec<&str> = line.split(':').collect();
                if parts.len() == 2 {
                    let key = parts[0].trim();
                    let value = parts[1].split_whitespace().next();
                    match key {
                        "MemTotal" => {
                            mem.insert("total_mb".to_string(), serde_json::json!(Self::parse_mem_value(value)));
                        }
                        "MemFree" => {
                            mem.insert("free_mb".to_string(), serde_json::json!(Self::parse_mem_value(value)));
                        }
                        "MemAvailable" => {
                            mem.insert("available_mb".to_string(), serde_json::json!(Self::parse_mem_value(value)));
                        }
                        _ => {}
                    }
                }
            }
        }
        serde_json::Value::Object(mem)
    }

    fn parse_mem_value(value: Option<&str>) -> f64 {
        match value {
            Some(v) => v.parse::<u64>().unwrap_or(0) as f64 / 1024.0,
            None => 0.0,
        }
    }

    fn get_cpu_info() -> serde_json::Value {
        let mut cpu = serde_json::Map::new();
        if let Ok(content) = std::fs::read_to_string("/proc/cpuinfo") {
            let core_count = content.lines().filter(|l| l.starts_with("processor")).count();
            cpu.insert("cores".to_string(), serde_json::json!(core_count));
        }
        cpu.insert("usage_percent".to_string(), serde_json::json!(Self::get_cpu_usage()));
        serde_json::Value::Object(cpu)
    }

    fn get_cpu_usage() -> f64 {
        if let Ok(content) = std::fs::read_to_string("/proc/stat") {
            let lines: Vec<&str> = content.lines().collect();
            if let Some(first_line) = lines.first() {
                let parts: Vec<&str> = first_line.split_whitespace().collect();
                if parts.len() >= 8 {
                    let user: u64 = parts[1].parse().unwrap_or(0);
                    let system: u64 = parts[3].parse().unwrap_or(0);
                    let idle: u64 = parts[4].parse().unwrap_or(0);
                    let total = user + system + idle;
                    if total > 0 {
                        return ((user + system) as f64 / total as f64) * 100.0;
                    }
                }
            }
        }
        0.0
    }

    fn get_disk_info() -> serde_json::Value {
        let mut disks = Vec::new();
        if let Ok(output) = Command::new("df")
            .args(["-h", "-P", "-x", "tmpfs", "-x", "devtmpfs"])
            .output()
        {
            if let Ok(stdout) = String::from_utf8(output.stdout) {
                for line in stdout.lines().skip(1) {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 6 {
                        disks.push(serde_json::json!({
                            "filesystem": parts[0],
                            "size": parts[1],
                            "used": parts[2],
                            "available": parts[3],
                            "use_percent": parts[4],
                            "mount": parts[5],
                        }));
                    }
                }
            }
        }
        serde_json::Value::Array(disks)
    }

    fn get_uptime() -> String {
        if let Ok(content) = std::fs::read_to_string("/proc/uptime") {
            let parts: Vec<&str> = content.split_whitespace().collect();
            if let Some(uptime_str) = parts.first() {
                if let Ok(uptime_secs) = uptime_str.parse::<f64>() {
                    let days = (uptime_secs / 86400.0) as u64;
                    let hours = ((uptime_secs % 86400.0) / 3600.0) as u64;
                    let minutes = ((uptime_secs % 3600.0) / 60.0) as u64;
                    let seconds = (uptime_secs % 60.0) as u64;
                    return format!("{}d {}h {}m {}s", days, hours, minutes, seconds);
                }
            }
        }
        "unknown".to_string()
    }
}
