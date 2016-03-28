from django import template
from datetime import date, timedelta

register = template.Library()

@register.simple_tag
def due_date(date, format_string):
    return date.strftime(format_string)

@register.simple_tag
def due_date_default(date):
    return date.strftime("%B %d")
