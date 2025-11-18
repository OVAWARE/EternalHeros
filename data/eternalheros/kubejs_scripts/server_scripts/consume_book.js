ItemEvents.rightClicked(event => {
  const player = event.player ?? event.getPlayer();
  const item   = event.item   ?? event.getItem();
  if (!player || !item) return;

  if(!palladium.superpowers.hasSuperpower(player, "eternalheros:enchanter")) return;

  if (item.id !== 'minecraft:enchanted_book' || !item.nbt) return;

  let enchants = item.nbt.getList("StoredEnchantments", 10);
  if (!enchants || enchants.length === 0) return;

  enchants.forEach(e => {
    let id  = e.getString("id");
    let lvl = e.getShort("lvl");
    let tagName = id.split(":")[1] + lvl;
    event.server.runCommandSilent(`tag ${player.username} add ${tagName}`);
  });

  // Play totem sound at player
  event.server.runCommandSilent(
    `playsound minecraft:item.totem.use master ${player.username} ${player.x} ${player.y} ${player.z} 1 1`
  );

  // Spiral of particles
  const steps = 48, turns = 2, radius = 1.6, height = 2.0;
  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let angle = t * (Math.PI * 2 * turns);
    let px = player.x + Math.cos(angle) * radius;
    let py = player.y + 1.0 + t * height;
    let pz = player.z + Math.sin(angle) * radius;
    event.server.runCommandSilent(
      `particle minecraft:totem_of_undying ${px} ${py} ${pz} 0 0 0 0 1 100 force`
    );
  }

  // Consume exactly 1 book from the clicked stack (keeps NBT on the rest)
  item.shrink(1);
});
