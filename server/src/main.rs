use std::net::{IpAddr, SocketAddr};
use axum::{Router, Server};
use axum::routing::get;

#[tokio::main]
async fn main() -> () {
    let router = Router::new()
        .route("/about", get(about_handler))
        .route("/websocket", get(websocket_handler));
    let addr = addr();
    let axum_builder = axum::Server::bind(&addr);
    println!("server started");
    axum_builder.serve(router.into_make_service()).await.unwrap();
}

async fn about_handler<'l1>() -> &'l1 str {
    "return value from 'about_handler'"
}

async fn websocket_handler() -> () {

}

fn addr() -> SocketAddr {
    let ip_array: [u8; 4] = [127, 0, 0, 1];
    let ip: IpAddr = IpAddr::from(ip_array);
    let port: u16 = 10000;
    let addr: SocketAddr = SocketAddr::new(ip, port);
    addr
}
