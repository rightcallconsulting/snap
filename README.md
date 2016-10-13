# Snap
Our Snap product's webapp code

<h3>Snap Development Tips</h3>
<h4>Javascript models</h4>
<ul>
	<li>When adding memeber variables to formation, play, concept, or player JS models make
	sure to implement the functionality for the new var in the deepCopy and 
	createFromJson functions to prevent losing that information. Also include the new
	var in the stringify function to send it to the database.</li>
</ul>

<h3>Right Call Consulting Style Guide</h3>
<h4>General</h4>
<h5>Indenting</h5>
<ul>
	<li>Indent using tabs</li>
	<li>Tab size: 4</li>
</ul>
<h4>Python</h4>
<h4>HTML5</h4>
<h4>CSS</h4>
<h4>JavaScript</h4>
<p>
	'innerHTML' is a non-standard function and won't always be consistent across 
	browsers. Use it only if there is a good justifiable reason. Instead of 'innerHTML' 
	use the DOM operations to manipulate nodes in the HTML as this has more consistent
	behavior.
</p>
<h5>JQuery</h5>
<ul>
	<li>Always use the .done() .fail() .always() (especially .fail()) callbacks when you can. It will make your debugging life and that of your friend's much less stressful</li>
</ul>
