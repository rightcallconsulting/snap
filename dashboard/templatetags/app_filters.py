from django import template
from datetime import date, timedelta
#from utils.PlayerAnalytics import PlayerAnalytics

register = template.Library()

@register.simple_tag
def due_date(date, format_string):
    return date.strftime(format_string)

@register.simple_tag
def due_date_default(date):
    return date.strftime("%B %d")

@register.simple_tag
def to_percent(n, d):
    return int(n / d * 100.0)

@register.simple_tag
def get_percent_correct(analytics, play):
    return analytics.get_correct_percentage(play)

@register.simple_tag
def get_percent_incorrect(analytics, play):
    return analytics.get_incorrect_percentage(play)

@register.simple_tag
def get_percent_skipped(analytics, play):
    return analytics.get_skipped_percentage(play)
