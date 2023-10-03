use std::net::{IpAddr, SocketAddr};
use axum::{Router, Server};
use axum::routing::get;

mod service;

#[tokio::main]
async fn main() -> () {
    let router: Router = Router::new()
        .route("/about", get(service::about_handler))
        .route("/connection", get(service::connection_handler_ws_http_upgrade));
    let addr: SocketAddr = addr();
    let axum_builder = Server::bind(&addr);
    println!("server started");
    axum_builder.serve(router.into_make_service()).await.unwrap();
}

fn addr() -> SocketAddr {
    let ip_array: [u8; 4] = [127, 0, 0, 1];
    let ip: IpAddr = IpAddr::from(ip_array);
    let port: u16 = 8080;
    let addr: SocketAddr = SocketAddr::new(ip, port);
    addr
}
