import {useState, useEffect} from 'react';
import axios from 'axios';

export default function Phreddit() {
    const [msg, setMsg] = useState("");
    
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/")
        .then((res) => {
            setMsg(res.data);
        })
        .catch((err) => {
            console.log("Request failed");
        });
    }, []);
    
  return (
    <h1> {msg} </h1>
  );
}
