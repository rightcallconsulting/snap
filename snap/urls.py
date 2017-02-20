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
from django.core.serializers import serialize
from django.http import HttpResponse
from getsnap.models import CustomUser
from playbook.models import Concept, Formation, Play
from quizzes.models import Quiz
from rest_framework import authentication, exceptions, routers, serializers, viewsets
from rest_framework.authtoken import views
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from IPython import embed

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

# class ConceptViewSet(viewsets.ModelViewSet):
#     queryset = Concept.objects.all()
#     serializer_class = ConceptSerializer

# class ConceptViewSet(viewsets.ViewSet):
#     def list(self, request):
#         queryset = Concept.objects.all()
#         serializer = ConceptSerializer(queryset, many=True)
#         return Response(serializer.data)

@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication))
@permission_classes((IsAuthenticated,))
def ConceptsView(request, format=None):
    concepts = Concept.objects.filter(team=request.user.player.team)
    serializer = ConceptSerializer(concepts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication))
@permission_classes((IsAuthenticated,))
def FormationsView(request, format=None):
    formations = Formation.objects.filter(team=request.user.player.team)
    serializer = FormationSerializer(formations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication))
@permission_classes((IsAuthenticated,))
def PlaysView(request, format=None):
    plays = Play.objects.filter(team=request.user.player.team)
    serializer = PlaySerializer(plays, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication))
@permission_classes((IsAuthenticated,))
def QuizzesView(request, format=None):
    quizzes = Quiz.objects.filter(players__in=[request.user.player])
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)

class FormationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Formation
        fields = ('name', 'unit', 'scout', 'formationJson')

# class FormationViewSet(viewsets.ModelViewSet):
#     queryset = Formation.objects.all()
#     serializer_class = FormationSerializer

class PlaySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Play
        fields = ('name', 'unit', 'scout', 'playJson')

# class PlayViewSet(viewsets.ModelViewSet):
#     queryset = Play.objects.all()
#     serializer_class = PlaySerializer

class QuizSerializer(serializers.ModelSerializer):
    formations = FormationSerializer(many=True, read_only=True)
    plays = PlaySerializer(many=True, read_only=True)
    concepts = ConceptSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ('name', 'formations', 'plays', 'concepts')

# class QuizViewSet(viewsets.ModelViewSet):
#     queryset = Quiz.objects.all()
#     serializer_class = QuizSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.SimpleRouter()
router.register(r'api/users', CustomUserViewSet)
#router.register(r'api/concepts/', ConceptsView)
# router.register(r'api/formations', FormationViewSet)
# router.register(r'api/plays', PlayViewSet)
# router.register(r'api/quizzes', QuizViewSet)

urlpatterns = [
    url(r'', include(router.urls)),
    url(r'api/concepts', ConceptsView),
    url(r'api/formations', FormationsView),
    url(r'api/plays', PlaysView),
    url(r'api/quizzes', QuizzesView),
    url(r'^api-token-auth/', views.obtain_auth_token),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^admin/', admin.site.urls),
	url(r'', include('dashboard.urls')),
	url(r'', include('getsnap.urls')),
	url(r'playbook/', include('playbook.urls')),
	url(r'quizzes/', include('quizzes.urls')),
	url(r'analytics/', include('analytics.urls'))
]
