import datetime

from django.db import models

class Formation(models.Model):
	title = models.CharField(
		verbose_name="Title",
		max_length=60, blank=False)

	pub_date = models.DateTimeField(
		blank=True, null=True,
		auto_now_add=True,
		verbose_name="Publication Date")

	description = models.TextField(
		verbose_name="Description",
		blank=True, help_text="a description of the formation")

	def __unicode__(self):
		return self.title