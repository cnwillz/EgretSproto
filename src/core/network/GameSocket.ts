namespace network {
    export class GameSocket {
        private sessionId: number = 0;
        private sessions:  { [key: string]: Function; } = {};
        private handlers: { [key: string]: Function; } = {};
        private socket: egret.WebSocket;
        public rpc: sproto.SprotoRpc;

        constructor(s2c: sproto.SprotoManager, c2s: sproto.SprotoManager) {
            this.rpc = new sproto.SprotoRpc(s2c, c2s)
        }

        public initSocket(): void {
            try {
                //创建 WebSocket 对象
                this.socket = new egret.WebSocket();
                //设置数据格式为二进制，默认为字符串
                this.socket.type = egret.WebSocket.TYPE_BINARY;
                //添加收到数据侦听，收到数据会调用此方法
                this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);
                //添加链接打开侦听，连接成功会调用此方法
                this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
                //添加链接关闭侦听，手动关闭或者服务器关闭连接会调用此方法
                this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
                //添加异常侦听，出现异常会调用此方法
                this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
                this.socket.connect("127.0.0.1", 8888);
            } catch(e) {
                console.error(e);
            }
        }

        public addHandler(proto: string, handler: Function): void {
            this.handlers[proto] = handler;
        }

        public removeHandler(proto: string): void {
            delete this.handlers[proto]
        }

        public getHandler(proto: string): Function {
            let handler: Function = null;
            if(this.handlers.hasOwnProperty(proto))
                handler = this.handlers[proto];
            return handler;
        }

        public dispatch(buffer: bufferjs.Buffer): any {
            let message = this.rpc.unpackMessage(buffer);
            console.log(message)
        }

        public sendRequest(proto: string, data: any = null, handler: Function = null): any {
            let sid = 0;
            if(handler != null) {
                this.sessionId++;
                sid = this.sessionId;
                this.sessions[<string><any>sid] = handler;
            }
            //TODO: 复制缓存区可能存在性能损耗
            let buffer = this.rpc.packRequest(proto, data, sid);
            var byte:egret.ByteArray = new egret.ByteArray(buffer);
            this.socket.writeBytes(byte);
            console.log(buffer, byte)
        }

        private onReceiveMessage(e: egret.Event): void {
            //创建 ByteArray 对象
            var byte:egret.ByteArray = new egret.ByteArray();
            //读取数据
            this.socket.readBytes(byte);
            //TODO: 复制缓存区可能存在性能损耗
            let buffer = bufferjs.Buffer.from(byte.bytes);
            console.log(buffer)
            this.dispatch(buffer)
        }

        private onSocketOpen(): void {
            console.info("WebSocketOpen")
            this.socket.writeUTF("hello skynet")
            this.socket.writeUTF("hello skynet")
            this.socket.writeUTF("hello skynet")
            this.socket.writeUTF("hello skynet")
            this.socket.writeUTF("hello skynet")
            this.sendRequest("handshake")
            this.sendRequest("set", { what : "hello", value : "world" })
        }

        private onSocketClose(): void {
            console.info("WebSocketClose")
        }

        private onSocketError(): void {
            console.error("WebSocketError")
        }
    }
}