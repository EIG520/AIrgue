'use client';
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import send from "./send";
import get_aires from "./get_aires";

let ai_writing = false;
const id = ""+Math.random();

export function MessageArea() {
    const arr: string[] = [];
    const [msgs, setMsgs] = useState(arr);

    return (
        <div>
            <MessageLog msgs={msgs}/>
            <ChatBox msgs={msgs} setMsgs={setMsgs}/>
        </div>
    )
}

type msgsPropRW = { msgs: string[], setMsgs: Dispatch<SetStateAction<string[]>>};
export function ChatBox( props: msgsPropRW ) {
    const [vin, setVin] = useState('');

    return (
        <div>
            <div id="cb">
                <form id="chatbox" onSubmit={e => onSubmit(e,vin,setVin,props.msgs,props.setMsgs)}>
                    <textarea id="cbin" value={vin} onChange={e => setVin(e.target.value)}></textarea>
                    <input type="submit"></input>
                </form>
            </div>
        </div>
    );
}

type msgsProp = { msgs: string[] }
export function MessageLog( prop: msgsProp ) {

    return (
        <div className="message_box">
            {Array.from(prop.msgs.entries()).map(a => 
                <div key={a[0]+""}><textarea className="message" value={a[1]+""} readOnly={true}/></div>
            )}
        </div>
    )
}

async function onSubmit(event: FormEvent<HTMLFormElement>, vin:string, setVin: Dispatch<SetStateAction<string>>, msgs:&string[], setMsgs: Dispatch<SetStateAction<string[]>>) {  
    let msgscpy = msgs.slice();
    
    event.preventDefault();
    if (ai_writing) { return; }

    let svin: string = vin;
    setVin("");
    msgscpy.push(svin); setMsgs(msgscpy);
    send(svin, id);

    ai_writing = true;
    console.log(id);
    msgscpy.push(""); setMsgs(msgscpy.slice());

    let word = await get_aires(id);
    while (word) {
        msgscpy.push((msgscpy.pop()??"") + word + " ");
        setMsgs(msgscpy.slice());

        word = await get_aires(id);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    ai_writing = false;
}