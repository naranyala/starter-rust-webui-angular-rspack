//! AnalyticsService — business intelligence queries.

use std::collections::HashMap;
use std::sync::Arc;

use crate::core::errors::AppResult;
use crate::core::database::models::{ProductStats, RevenueData, SalesTrend};
use crate::core::database::Database;

pub struct AnalyticsService {
    db: Arc<Database>,
}

impl AnalyticsService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_sales_trend(&self, days: i32) -> AppResult<Vec<SalesTrend>> {
        let orders = self.db.get_all_orders()?;
        let start_date = chrono::Utc::now() - chrono::Duration::days(days as i64);
        let mut daily_stats: HashMap<String, SalesTrend> = HashMap::new();

        for order in orders {
            let date_str = order.created_at[..10].to_string();
            if date_str < start_date.format("%Y-%m-%d").to_string() {
                continue;
            }

            let stats = daily_stats.entry(date_str.clone()).or_insert_with(|| SalesTrend {
                date: date_str,
                order_count: 0,
                total_quantity: 0,
                total_revenue: 0.0,
                avg_order_value: 0.0,
            });

            stats.order_count += 1;
            stats.total_quantity += order.quantity;
            stats.total_revenue += order.total_price;
        }

        let mut result: Vec<SalesTrend> = daily_stats.into_values().collect();
        for stats in &mut result {
            if stats.order_count > 0 {
                stats.avg_order_value = stats.total_revenue / stats.order_count as f64;
            }
        }

        result.sort_by(|a, b| a.date.cmp(&b.date));
        Ok(result)
    }

    pub fn get_top_products(&self, limit: i32) -> AppResult<Vec<ProductStats>> {
        let orders = self.db.get_all_orders()?;
        let products = self.db.get_all_products()?;

        let mut product_map: HashMap<i64, ProductStats> = products
            .into_iter()
            .map(|p| {
                (
                    p.id,
                    ProductStats {
                        id: p.id,
                        name: p.name.clone(),
                        category: p.category.clone(),
                        order_count: 0,
                        total_sold: 0,
                        total_revenue: 0.0,
                    },
                )
            })
            .collect();

        for order in orders {
            if let Some(stats) = product_map.get_mut(&order.product_id) {
                stats.order_count += 1;
                stats.total_sold += order.quantity;
                stats.total_revenue += order.total_price;
            }
        }

        let mut result: Vec<ProductStats> = product_map.into_values().collect();
        result.sort_by(|a, b| {
            b.total_revenue
                .partial_cmp(&a.total_revenue)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        result.truncate(limit as usize);
        Ok(result)
    }

    pub fn get_revenue_by_period(&self, period: &str) -> AppResult<Vec<RevenueData>> {
        let orders = self.db.get_all_orders()?;
        let mut period_map: HashMap<String, RevenueData> = HashMap::new();

        for order in orders {
            let period_key = match period {
                "daily" => order.created_at[..10].to_string(),
                "monthly" => order.created_at[..7].to_string(),
                "quarterly" => {
                    let year = &order.created_at[..4];
                    let month: u32 = order.created_at[5..7].parse().unwrap_or(1);
                    let quarter = (month - 1) / 3 + 1;
                    format!("{}-Q{}", year, quarter)
                }
                _ => order.created_at[..10].to_string(),
            };

            let data = period_map.entry(period_key.clone()).or_insert_with(|| RevenueData {
                period: period_key,
                revenue: 0.0,
                transactions: 0,
            });

            data.revenue += order.total_price;
            data.transactions += 1;
        }

        let mut result: Vec<RevenueData> = period_map.into_values().collect();
        result.sort_by(|a, b| b.period.cmp(&a.period));
        Ok(result)
    }
}
