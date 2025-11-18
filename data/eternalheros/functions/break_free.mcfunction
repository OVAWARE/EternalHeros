# 1. Make sure the scoreboard exists
scoreboard objectives add broken_free dummy

# 2. Initialize to 500 if the entity does not have a score yet
execute as @e[tag=broken_free] unless score @s broken_free matches 1.. run scoreboard players set @s broken_free 500

# 3. Tick down by 1 for entities with score > 0
execute as @e[tag=broken_free] if score @s broken_free matches 1.. run scoreboard players remove @s broken_free 1

# 4. Remove tag if score is 0
execute as @e[tag=broken_free] if score @s broken_free matches 0 run tag @s remove broken_free
