use std::net::{IpAddr, SocketAddr};
use axum::Router;
use axum::extract::ws::{Message, WebSocketUpgrade};
use axum::extract::ws::WebSocket;
use axum::routing::get;
use futures::{SinkExt, StreamExt};

#[tokio::main]
async fn main() -> () {
    let router = Router::new()
        .route("/about", get(about_handler))
        .route("/websocket", get(websocket_handler_ws_http_upgrade));
    let addr = addr();
    let axum_builder = axum::Server::bind(&addr);
    println!("server started");
    axum_builder.serve(router.into_make_service()).await.unwrap();
}

async fn about_handler<'l1>() -> &'l1 str {
    "return value from 'about_handler'"
}

async fn websocket_handler_ws_http_upgrade(ws_http_upgrade: WebSocketUpgrade) -> () {
    println!("websocket_handler_ws_http_upgrade: triggered");
    ws_http_upgrade.on_upgrade(websocket_handler);
}

async fn websocket_handler(ws: WebSocket) -> () {
    println!("websocket_handler: triggered");
    let (mut ws_sender, mut ws_receiver) = ws.split();
    while let Some(try_msg) = ws_receiver.next().await {
        match try_msg {
            Ok(msg_obj) => {
                println!("websocket_handler: new message received");
                let msg_value = msg_obj.to_text().unwrap();
                ws_sender.send(Message::Text(msg_value.to_string())).await.unwrap();
            }
            Err(e) => {
                println!("websocket_handler: an error occurred: {}", e);
                ws_sender.send(Message::Text(e.to_string())).await.unwrap();
            }
        }
    }
    println!("websocket_handler: finished");
}

fn addr() -> SocketAddr {
    let ip_array: [u8; 4] = [127, 0, 0, 1];
    let ip: IpAddr = IpAddr::from(ip_array);
    let port: u16 = 10000;
    let addr: SocketAddr = SocketAddr::new(ip, port);
    addr
}
