namespace sproto {
	export class SprotoProtocol {
		public constructor(public name: string, public tag: number, public request: string, public response: string) {
		}
	}
}