function router(ctx) {
    args = ctx.state.command
    switch(args.command) {
        case 'reminders':
            ctx.reply("------- REMINDERS HERE -------")
            break;
        default:
            ctx.reply("You have entered an invalid command b-baka")
            break;
    }
}

module.exports.router = router