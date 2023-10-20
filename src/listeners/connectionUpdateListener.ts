import { Listener, ListenerOptions } from "../stores/Listener.js";
import { BaileysEventMap, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { rmSync } from "node:fs";
import { cast } from "@sapphire/utilities";
import { ApplyOptions } from "@nezuchan/decorators";

@ApplyOptions<ListenerOptions>({
    event: "connection.update",
    emitter: "_sEmitter"
})
export class ConnectionUpdate extends Listener {
    public async run({ lastDisconnect, connection }: BaileysEventMap["connection.update"]): Promise<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-unnecessary-condition
        const shouldReconnect = cast<Boom | undefined>(lastDisconnect)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (connection === "close") {
            this.container.client.logger.warn(
                `Connection closed due to ${lastDisconnect?.error?.message ?? "unknown reason"
                }, reconnecting ${shouldReconnect}`
            );
            if (shouldReconnect) {
                await this.container.client.login();
            } else {
                rmSync(`${process.cwd()}/auth_state`, {
                    recursive: true,
                    force: true
                });
            }
        } else if (connection === "open") {
            this.container.client.logger.info("Opened connection.");
        }
    }
}
