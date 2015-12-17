from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^players$', views.players, name='players'),
    url(r'^players/(?P<player_id>[0-9]+)', views.player_detail, name='player_detail'),
]
