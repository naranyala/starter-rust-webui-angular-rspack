//! System Info WebUI Handler — delegates to SysInfoService (no duplication).

use crate::core::presentation::webui::handler_utils;
use crate::core::services::sysinfo_service::SysInfoService;
use log::info;
use webui_rs::webui;

pub fn setup_sysinfo_handlers(window: &mut webui::Window) {
    window.bind("get_system_info", |event| {
        info!("get_system_info called from frontend");
        let sysinfo = SysInfoService::get_system_info();
        let response = serde_json::json!({
            "success": true,
            "data": sysinfo
        });
        handler_utils::dispatch_event(
            webui::Window::from_id(event.window),
            "sysinfo_response",
            &response,
        );
    });
    info!("System info handlers set up successfully");
}
