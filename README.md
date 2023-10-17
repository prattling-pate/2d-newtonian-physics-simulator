# 2D Newtonian mechanics simulation with data logger

## This the 1st complete version of this program.

### Still some issues to work out and things that could be expanded upon:
Mainly just random bugs to do with changing scale factor multiple times in a row
Objects phase through each other at low speed impacts due to no rest force handling
  - Can be added by checking if no change in velocity after collision
  - This technically isn't needed for it's purpose of teaching collisions, only for fun p much

### Potential changes
Grid spatial partitioning can be used to optimize the collision system
  - divide canvas into 3x3 grid, register each object into a grid and only check collision against the objects in the grid (still O(n^2) but with a smaller leading coefficient).
  
## Other than that it is finished

This webapp is hosted on Github Pages: https://notkacper.github.io/2d-newtonian-physics-simulator/
