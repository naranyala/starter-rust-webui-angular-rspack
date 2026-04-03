use crate::core::presentation::webui::handler_utils;
use log::{debug, info};
use webui_rs::webui;

pub fn setup_ui_handlers(window: &mut webui::Window) {
    window.bind("open_folder", |_event| {
        info!("Open folder button clicked!");
    });
    window.bind("organize_images", |_event| {
        info!("Organize images button clicked!");
    });
}

pub fn setup_counter_handlers(window: &mut webui::Window) {
    window.bind("increment_counter", |event| {
        let element_name = handler_utils::element_name(&event);
        info!("Counter incremented - Element: {}", element_name);
        debug!("Increment event details - element: {}, window: {}", element_name, event.window);
    });
    window.bind("reset_counter", |event| {
        let element_name = handler_utils::element_name(&event);
        info!("Counter reset - Element: {}", element_name);
        debug!("Reset event details - element: {}, window: {}", element_name, event.window);
    });
}
