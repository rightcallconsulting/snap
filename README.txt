# Snap
Our Snap product's webapp code

Snap Development Tips
-Javascript models
---When adding memeber variables to formation, play, concept, or player JS models make
	sure to implement the functionality for the new var in the deepCopy and 
	createFromJson functions to prevent losing that information. Also include the new
	var in the stringify function to send it to the database.

Right Call Consulting Style Guide

-General
---Indenting
----- *Indent using tabs
----- *Tab size: 4

-Python

-HTML5

-CSS

-JavaScript
---'innerHTML' is a non-standard function and won't always be consistent across 
	browsers. Use it only if there is a good justifiable reason. Instead of 'innerHTML' 
	use the DOM operations to manipulate nodes in the HTML as this has more consistent
	behavior.

---JQuery
----Always use the .done() .fail() .always() (especially .fail()) callbacks when you can. 
	It will make your debugging life and that of your friend's much less stressful.
