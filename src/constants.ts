const Constants = {
    CONFIG_BANNED_USERS_FILE_INTRO: `# Banned users file
# The bot will ignore users of provided profile IDs.
# One line must have one ID at a time.
# You can write a comment after the ID for your own purposes.
# The bot will periodically (5m) fetch the contents of the list.
# Example entry (without the front #)
# 12345678912345 Advertising using bot
# =================
`,
    CONFIG_CURRENT_CONFIG_VERSION: "1",
    BANNED_USER_MESSAGE: "https://cdn.discordapp.com/attachments/771671817634447373/1205746764884353024/jerma.gif"
};

export default Constants;
