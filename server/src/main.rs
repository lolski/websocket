use std::net::{IpAddr, SocketAddr};
use axum::Router;
use axum::routing::get;

mod service;

#[tokio::main]
async fn main() -> () {
    let router = Router::new()
        .route("/about", get(service::about_handler))
        .route("/websocket", get(service::websocket_handler_ws_http_upgrade));
    let addr = addr();
    let axum_builder = axum::Server::bind(&addr);
    println!("server started");
    axum_builder.serve(router.into_make_service()).await.unwrap();
}

fn addr() -> SocketAddr {
    let ip_array: [u8; 4] = [127, 0, 0, 1];
    let ip: IpAddr = IpAddr::from(ip_array);
    let port: u16 = 10000;
    let addr: SocketAddr = SocketAddr::new(ip, port);
    addr
}
