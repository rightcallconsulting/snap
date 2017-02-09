"""snap URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from getsnap.models import CustomUser
from playbook.models import Concept, Formation, Play
from quizzes.models import Quiz
from rest_framework import routers, serializers, viewsets

class CustomUserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'email')

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class ConceptSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Concept
        fields = ('name', 'unit', 'scout', 'conceptJson')

class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer

class FormationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Formation
        fields = ('name', 'unit', 'scout', 'formationJson')

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer

class PlaySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Play
        fields = ('name', 'unit', 'scout', 'playJson')

class PlayViewSet(viewsets.ModelViewSet):
    queryset = Play.objects.all()
    serializer_class = PlaySerializer

class QuizSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Quiz
        fields = ('name', 'formations', 'plays', 'concepts')

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.SimpleRouter()
router.register(r'api/users', CustomUserViewSet)
router.register(r'api/concepts', ConceptViewSet)
router.register(r'api/formations', FormationViewSet)
router.register(r'api/plays', PlayViewSet)
router.register(r'api/quizzes', QuizViewSet)

urlpatterns = [
    url(r'', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^admin/', admin.site.urls),
	url(r'', include('dashboard.urls')),
	url(r'', include('getsnap.urls')),
	url(r'playbook/', include('playbook.urls')),
	url(r'quizzes/', include('quizzes.urls')),
	url(r'analytics/', include('analytics.urls'))
]
