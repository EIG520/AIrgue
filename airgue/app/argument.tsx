'use client';
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import send from "./send";

let ai_writing = false;

export function MessageArea() {
    const [msgs, setMsgs] = useState(['apple', 'banaanaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']);

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
            {prop.msgs.map(e => 
                <textarea className="message" value={e} readOnly={true}/>
            )}
        </div>
    )
}

async function onSubmit(event: FormEvent<HTMLFormElement>, vin:string, setVin: Dispatch<SetStateAction<string>>, msgs:string[], setMsgs: Dispatch<SetStateAction<string[]>>) {  
    event.preventDefault();
    if (ai_writing) { return; }

    let svin: string = vin;
    setVin("");
    setMsgs(msgs.concat(svin));
    send(svin);

    ai_writing = true;


}