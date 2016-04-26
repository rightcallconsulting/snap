from django import template
from datetime import date, timedelta
from IPython import embed
from dashboard.utils import PlayerAnalytics

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
def get_percent_correct_player(player):
    analytics = PlayerAnalytics.for_single_player(player)
    return int(analytics.total_correct_attempts_percentage())

@register.simple_tag
def get_percent_correct(analytics, play):
    return analytics.correct_percentage_for_play(play)

@register.simple_tag
def get_percent_incorrect(analytics, play):
    return analytics.incorrect_percentage_for_play(play)

@register.simple_tag
def get_percent_skipped(analytics, play):
    return analytics.skipped_percentage_for_play(play)
