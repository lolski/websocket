use std::net::{IpAddr, SocketAddr};
use axum::Router;
use axum::extract::ws::{Message, WebSocketUpgrade};
use axum::extract::ws::WebSocket;
use axum::response::Response;
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

async fn websocket_handler_ws_http_upgrade(ws_http_upgrade: WebSocketUpgrade) -> Response {
    println!("websocket_handler_ws_http_upgrade: triggered");
    return ws_http_upgrade.on_upgrade(websocket_handler);
}

async fn websocket_handler(ws: WebSocket) -> () {
    println!("websocket_handler: triggered");
    let (mut ws_sender, mut ws_receiver) = ws.split();
    while let Some(try_request) = ws_receiver.next().await {
        match try_request {
            Ok(msg_request) => {
                println!("websocket_handler: new message received");
                let request_value = msg_request.to_text().unwrap();
                let response = Message::Text(format!("response for '{}'", request_value.to_string()));
                let try_send = ws_sender.send(response).await;
                match try_send {
                    Ok(()) => {}
                    Err(e) => {
                        break;
                    }
                }
            }
            Err(e) => {
                println!("websocket_handler: an error occurred: {}", e);
                let response = Message::Text(format!("response for the following error '{}'", e.to_string()));
                let try_send = ws_sender.send(response).await;
                match try_send {
                    Ok(()) => {}
                    Err(e) => {
                        break;
                    }
                }
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
