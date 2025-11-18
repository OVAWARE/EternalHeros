let settings = {
    power: "eternalheros:enchanter",
    stats: {
        "minecraft:generic.attack_damage": 0.5,
        "minecraft:generic.armor": 0.5,
        "minecraft:generic.max_health": 0.5
    },
    checkInterval: 40
};

let playerLevels = {};

ServerEvents.tick(event => {
    if (event.server.tickCount % settings.checkInterval !== 0) return;
    
    event.server.players.forEach(player => {
        try {
            let playerUUID = player.stringUUID;
            let currentLevel = player.xpLevel;
            let lastLevel = playerLevels[playerUUID] || -1;
            
            let hasPower = palladium.superpowers.hasSuperpower(player, new ResourceLocation(settings.power));
            
            if (hasPower && (lastLevel !== currentLevel || lastLevel === -1)) {
                // Apply boosts using commands
                Object.entries(settings.stats).forEach(([attribute, multiplier]) => {
                    let boost = currentLevel * multiplier;

                    let removal = `attribute ${player.name.string} ${attribute} modifier remove b3a255de-0dd9-42f5-a538-028dfc4174a9`;
                    event.server.runCommandSilent(removal);

                    let command = `attribute ${player.name.string} ${attribute} modifier add b3a255de-0dd9-42f5-a538-028dfc4174a9 enchanter_${attribute.replace(':', '_').replace('.', '_')} ${boost} add`;
                    event.server.runCommandSilent(command);
                });
                
                playerLevels[playerUUID] = currentLevel;
            } else if (!hasPower && lastLevel !== -1) {
                // Remove boosts using commands
                Object.keys(settings.stats).forEach(attribute => {
                    let command = `attribute ${player.name.string} ${attribute} modifier remove b3a255de-0dd9-42f5-a538-028dfc4174a9`;
                    event.server.runCommandSilent(command);
                });
                
                delete playerLevels[playerUUID];
            }
            
        } catch (error) {
            console.error(`Error processing player ${player.name.string}: ${error}`);
        }
    });
});

PlayerEvents.loggedOut(event => {
    delete playerLevels[event.player.stringUUID];
});

PlayerEvents.loggedIn(event => {
    playerLevels[event.player.stringUUID] = -1;
});