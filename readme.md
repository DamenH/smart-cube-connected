# Reverse Engineering the Rubik's Connected

## Introduction

The Rubik's Connected is a cube puzzle that can connect to a phone via BlueTooth. This allows a person to see the moves they execute on the Rubik's Connected app as they happen. This ability can be very useful to solvers of all skill levels. The app comes with a series of hands-on tutorials that can teach a person how the cube works and how to solve it. It also has scrambling and timing capability, and can allow people to compete head-to-head against each other.

What the app lacks is support for more advanced solvers trying to solve the cube faster using non-beginner techniques, or doing different challenges, such as blindfolded solves, or fewest moves solves. This lack of features draws one to third party applications. Unfortunately I was unable to find any that supported the Rubik's Connected, so I went about creating my own. This requires finding how the cube communicates with the app, and that is the subject of this write-up.

## Understanding the Cube

To understand some aspects of reverse engineering the communication, a brief understanding about how the cube works mechanically is needed. The 3x3 Cube Puzzle, of which there are many brands and manufacturers beyond the original Rubik, consists of 12 edge pieces that have 2 colors, and 8 corner pieces that have 3. These pieces move relative to 6 center pieces of the 6 different colors. These center pieces are fixed in that they are always the same relative to each other. With standard coloring, white is opposite of yellow, green opposite blue, and red opposite orange. With the white center on top and green center facing you, the red is on the right of the cube and the orange is on the left.

This mentality of pieces is contrary to many peoples understanding of the puzzle. They see stickers randomly placed around the cube, while even a beginner solver will see pieces of verying types with different orientations and positions. Many people can "solve" one color without any prior experience, when really that solved face puts the cube no closer to being solved then when it was first scrambled.

### Manipulting the Cube
The cube has 6 faces (as do most cubes). Each of these faces can be turned clockwise and counter clockwise. Cubers have developed a notation for these moves.

 - F for front face (closest to you).
 - B for back.
 - L for left.
 - R for right.
 - U for up, the top face.
 - D for down, the bottom face.

You can also turn do a slice move. This is effectively turning 2 faces at the same time. These moves are notated

 - M for middle. Moving the layer between left and right face.
 - E for equatorial.
 - S for Standing layer. Perpendicular to middle.

Though the M move is usually the only slice move used in practice, the E and S moves are represented uniquely with the smart cube as we will see.

A move can be clockwise or counter-clockwise. A single quote ' denotes this move is "prime" for counter-clickwise. Clock direction is determined as if the face in question was closest to you. For M moves its clock follows that of L, E follows D, and S follows F. Double moves, turning a face or slice twice, can also be denoted with a 2 following the movement type.

Here is an example scramble.

M2 U' R2 D' S M2 U M' U2 F2 D' S M2 U' R2 U'
