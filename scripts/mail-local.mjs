import { SMTPServer } from "smtp-server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
// Local test inbox only. Never forwards mail and never logs login links.
const server = new SMTPServer({
  authOptional: true, disabledCommands: ["STARTTLS"],
  onData(stream, session, callback) {
    let message = "";
    stream.on("data", chunk => { message += chunk.toString(); });
    stream.on("end", async () => {
      try {
        await mkdir(".local/mail", { recursive: true });
        await writeFile(`.local/mail/${randomUUID()}.eml`, message);
        console.log("Test-E-Mail in .local/mail gespeichert.");
        callback();
      } catch (error) { callback(error); }
    });
  },
});
server.listen(1025, "127.0.0.1", () => console.log("Lokaler Test-Posteingang auf 127.0.0.1:1025"));
