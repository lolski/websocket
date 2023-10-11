use std::env;
use std::net::{IpAddr, SocketAddr};
use axum::{Router, Server};
use axum::routing::get;
mod service;

#[tokio::main]
async fn main() -> () {
    let args: Vec<String> = env::args().collect();
    let port = port(args.get(1), 8080).unwrap();
    let addr: SocketAddr = addr(port);
    let axum_builder = Server::bind(&addr);
    let router: Router = Router::new()
        .route("/about", get(service::about_handler))
        .route("/connection", get(service::connection_handler_ws_http_upgrade));
    println!("server started on {}", addr);
    axum_builder.serve(router.into_make_service()).await.unwrap();
}

fn port(arg_opt: Option<&String>, default: u16) -> Result<u16, ()> {
    match arg_opt {
        Some(arg) => {
            match arg.parse() {
                Ok(port) => Ok(port),
                Err(_e) => Err(())
            }
        }
        None => Ok(default)
    }
}

fn addr(port: u16) -> SocketAddr {
    let ip_array: [u8; 4] = [127, 0, 0, 1];
    let ip: IpAddr = IpAddr::from(ip_array);
    let addr: SocketAddr = SocketAddr::new(ip, port);
    addr
}
