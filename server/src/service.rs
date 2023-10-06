use axum::extract::ws::{Message, WebSocketUpgrade};
use axum::extract::ws::WebSocket;
use axum::response::Response;
use futures::{SinkExt, StreamExt};

pub async fn about_handler<'l1>() -> &'l1 str {
    let response: &'l1 str = "return value from 'about_handler'";
    return response;
}

pub async fn connection_handler_ws_http_upgrade(ws_http_upgrade: WebSocketUpgrade) -> Response {
    println!("connection_handler_ws_http_upgrade: triggered");
    return ws_http_upgrade.on_upgrade(connection_handler);
}

async fn connection_handler(ws: WebSocket) -> () {
    println!("connection_handler: triggered");
    let (mut ws_sender, mut ws_receiver) = ws.split();
    while let Some(try_request) = ws_receiver.next().await {
        match try_request {
            Ok(request) => {
                println!("connection_handler: new message received");
                let request_value = request.to_text().unwrap();
                println!("connection_handler: new message received = {}", request_value);
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
                println!("connection_handler: an error occurred: {}", e);
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
    println!("connection_handler: finished");
}

