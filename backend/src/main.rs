use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use actix_web::web::Data;
use reqwest::{self, Client, Response};
use serde::Deserialize;
use serde_json::{Value, json};

use std::collections::HashMap;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = Data::new(State {users: std::sync::Mutex::new(HashMap::new())});

    // env_logger::init_from_env(env_logger::Env::default().default_filter_or("trace"));
    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .service(send_message)
            .service(get_next_word)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

struct Conversation {
    prompt: Value,
    res: Option<Response>
}
#[derive(Debug, Deserialize)]
struct MicroMicroResponse {
    role: String,
    content: String
}

#[derive(Debug, Deserialize)]
struct MicroResponse {
    model: String,
    created_at: String,
    message: MicroMicroResponse,
    done: bool
}

impl Conversation {
    async fn send(&mut self, message: String) {
        let client = Client::new();

        if let Value::Object(map) = &mut self.prompt {
            if let Some(Value::Array(t)) = map.get_mut("messages") {
                t.push(json!({
                    "role": "user",
                    "content": message,
                }));
            }
        }

        println!("message: {}", self.prompt.to_string());
        
        let mut res = client.post("http://localhost:11434/api/chat")
            .body(self.prompt.to_string())
            .send()
            .await
            .unwrap();

        self.res = Some(res);
    }

    async fn next_word(&mut self) -> Option<String> {
        if let Some(d) = &mut self.res {
            if let Some(c) = d.chunk().await.unwrap() {
                let res = Some(serde_json::from_str::<MicroResponse>(&String::from_utf8(c.to_vec()).unwrap()).unwrap().message.content).unwrap();

                if let Value::Object(map) = &mut self.prompt {
                    if let Some(Value::Array(t)) = map.get_mut("messages") {
                        t.push(json!({
                            "role": "assistant",
                            "content": res,
                        }));
                    }
                }

                return Some(res);
            }
        }

        None
    }
}

struct State {
    users: std::sync::Mutex<HashMap<String, Conversation>>,
}

#[get("/{id}/{msg}")]
async fn send_message(path: web::Path<(String, String)>, state: web::Data<State>) -> impl Responder {
    let pin = path.into_inner();

    let id = pin.0;
    println!("{id}");
    let msg = pin.1;

    let mut users = state.users.lock().unwrap();

    if let None = users.get(&id) {
        (*users).insert(id.clone(), Conversation { prompt: json!({
            "model": "gemma3",
            "messages": []
        }), res: None });
    }

    let mut user = users.get_mut(&id).unwrap();
    user.send(msg).await;


    HttpResponse::Ok().body("Message Sent".to_string())
}

#[get("/{id}")]
async fn get_next_word(path: web::Path<String>, state: web::Data<State>) -> impl Responder {
    let id = path.into_inner();
    let mut users = state.users.lock().unwrap();

    let mut user = if let Some(t) = users.get_mut(&id) { t } else { println!("WHY"); return HttpResponse::NoContent().body(""); };

    if let Some(msg) = user.next_word().await {
        HttpResponse::Ok().body(msg)
    } else {
        HttpResponse::NoContent().body("")
    }
}