#  Rock, Paper, Scissors Battle  

The game where rock, paper, and scissors battle with one another.  
I’ve always seen this more as an **interactive experience** rather than just a viewport of a particle simulation.  
You can interact, create, destroy, and observe how chaos becomes balance — or not.  
  
This project simulates a dynamic world where **rocks, papers, and scissors** move freely and collide following the classic game rules.  
Each particle represents a character in constant motion, trying to dominate the others.  

---

## ⚙️ Collision Rules and Visual Effects  
- Each element  has position, velocity, and direction.  
- Collisions are detected by comparing the distance between two particles and their combined radius.  
- When a collision happens:
  - If they are the **same type**, they simply bounce and play a soft musical note.  
  - If they are **different**, the winning type transforms the other:
    - 🪨 Rock beats ✂️ Scissors  
    - ✂️ Scissors beat 📄 Paper  
    - 📄 Paper beats 🪨 Rock  
  - Each transformation triggers a **mini explosion** of particles, creating a dynamic and colorful effect that marks the impact point.

---

## Interactive Features  
-  **Ambient musical tones** that play when objects collide.  
-  **Explosion mode** — remove particles inside a circle with a click. You can make the circle bigger or smaller.  
-  **Creation modes** — add new rock, paper, or scissors particles interactively.  
-  **Speed control slider** to slow down or accelerate the simulation.  
-  **Restart button** to quickly reset the battlefield.  
-  **Winning sound** that plays when a type completely dominates the screen.  
-  **Explosion particles** each time different objects collide for extra visual feedback or when there is a explosion created by user. 

---

## 🚧 Difficulties and Future Ideas  
Some of the challenges included:
- Maintaining smooth performance with many active particles
- The sound effects did not reproduce as a loop
- Responsiveness

**Future improvements or ideas:**
- Upgrading particles (adding health, speed, or resistance).  
- Keeping track of how many rounds each team has won.  
- Introducing intelligent movement (particles chasing their enemies).  
- Adding visual themes or environmental effects (gravity, wind, obstacles).
- Adding a pause and mute button  


