use axum::extract::ws::{Message, WebSocketUpgrade};
use axum::extract::ws::WebSocket;
use axum::response::Response;
use futures::{SinkExt, StreamExt};

pub async fn about_handler<'l1>() -> &'l1 str {
    let response: &'l1 str = "return value from 'about_handler'";
    return response;
}

pub async fn websocket_handler_ws_http_upgrade(ws_http_upgrade: WebSocketUpgrade) -> Response {
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
                let response_value = format!("response for '{}'", request_value.to_string());
                let response = Message::Text(response_value.clone());
                let try_send = ws_sender.send(response).await;
                match try_send {
                    Ok(()) => {}
                    Err(e) => {
                        println!("Unable to send the response '{}' due to error '{}'", response_value, e);
                        break;
                    }
                }
            }
            Err(e) => {
                println!("websocket_handler: an error occurred: {}", e);
                let response_value = format!("response for the following error '{}'", e.to_string());
                let response = Message::Text(response_value.clone());
                let try_send = ws_sender.send(response).await;
                match try_send {
                    Ok(()) => {}
                    Err(e) => {
                        println!("Unable to send the response '{}' due to error '{}'", response_value, e);
                        break;
                    }
                }
            }
        }
    }
    println!("websocket_handler: finished");
}

