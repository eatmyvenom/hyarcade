const BotUtils = require("../discord/BotUtils");
const { logger } = require("../utils");

module.exports = class Command {
    name = "";
    allowed = [];
    callback = async function () {
        return { res: "command broke" };
    };

    constructor(name, allowed, callback) {
        this.name = name;
        this.allowed = allowed;
        this.callback = callback;
    }

    async execute(args, author, rawMsg, interaction) {
        if(this.allowed.includes("%trusted%")) this.allowed = BotUtils.trustedUsers;
        if (!this.allowed.includes(author) && !this.allowed.includes("*")) {
            logger.info(`${author} tried to run the ${this.name} command without permissions... only ${this.allowed.toString()} are allowed`)
            return { res: "" };
        }
        return await this.callback(args, rawMsg, interaction);
    }
};
