from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, UserRole , Role, Team, Assignment, SubTask, Submission, Review, Comment, Profile
from .serializers import (
    UserSerializer, UserRoleSerializer , RoleSerializer, TeamSerializer, AssignmentSerializer,
    SubTaskSerializer, SubmissionSerializer, ReviewSerializer, CommentSerializer, ProfileSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from django.contrib.auth import authenticate


from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests
import json
from django.http import JsonResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from django.views.decorators.csrf import csrf_exempt



from rest_framework.decorators import api_view
from google.oauth2 import id_token

@csrf_exempt 
@api_view(['POST'])
def google_login(request):
    token = request.data.get('token') 
    if not token:
        return JsonResponse({'error': 'Token not provided'}, status=400)

    try:
      
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), YOUR_CLIENT_ID)
  
        return JsonResponse({'message': 'Login successful', 'user': idinfo}, status=200)
    except ValueError:
        return JsonResponse({'error': 'Invalid token'}, status=400)

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 

    

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserRoleListCreateView(generics.ListCreateAPIView):
    queryset = UserRole.objects.all() 
    serializer_class = UserRoleSerializer
    permission_classes = [AllowAny]
 


class UserRoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [AllowAny]
    


class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class TeamListCreateView(generics.CreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
       
        team_instance = serializer.save(created_by=self.request.user)

       
        member_emails = self.request.data.get('members', [])
        members_queryset = User.objects.filter(email__in=member_emails)
        member_ids = [member.id for member in members_queryset] 

        
        team_instance.members = member_ids
        team_instance.save()

class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

       
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        team_instance = serializer.save()


        member_emails = request.data.get('members', [])
        members_queryset = User.objects.filter(email__in=member_emails)
        member_ids = [member.id for member in members_queryset]  # Only IDs

        # Assign the IDs to `members` and save
        team_instance.members = member_ids
        team_instance.save()

        return Response(serializer.data)


class TeamAssignmentsView(APIView):
     permission_classes = [IsAuthenticatedOrReadOnly]

     def get(self, request, member_id, format=None):
       
        teams_with_member = Team.objects.filter(members__contains=[member_id])
        
     
        assignments = Assignment.objects.filter(team__in=teams_with_member)
        
       
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser) 

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)  

class AssignmentDetailView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        reviewer_id = self.kwargs['reviewer_id'] 
        return Assignment.objects.filter(reviewers__id=reviewer_id) 
    

class AssignmentDetailByIDView(generics.RetrieveAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

 
    lookup_field = 'id'

class AssignmentReviewersView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk, format=None):
       
        assignment = get_object_or_404(Assignment, pk=pk)
       
        reviewers = assignment.reviewers.all()
        
        reviewer_data = [
            {"id": reviewer.id, "email": reviewer.email}
            for reviewer in reviewers
        ]
        
        return Response(reviewer_data)

class SubTaskListCreateView(generics.ListCreateAPIView):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

class SubTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

class AssignmentSubTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        assignment = get_object_or_404(Assignment, pk=pk)
        subtasks = SubTask.objects.filter(assignment=assignment)
        serializer = SubTaskSerializer(subtasks, many=True)
        return Response(serializer.data)

# CBV for Submission
class SubmissionListCreateView(generics.ListCreateAPIView):
       serializer_class = SubmissionSerializer
       permission_classes = [IsAuthenticatedOrReadOnly]

       def get_queryset(self):
        # Get the assignment_id from the URL
        assignment_id = self.kwargs.get('assignment_id')
        # Filter submissions by the assignment ID
        return Submission.objects.filter(assignment_id=assignment_id)

       def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_id')
        assignment = get_object_or_404(Assignment, id=assignment_id)

        try:
            # Explicitly add assignment to save method
            serializer.save(assignment=assignment, submitted_by=self.request.user)
        except ValidationError as e:
            print("Validation error:", e.detail)  # Log the error details for further debugging
            raise e

class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]



# CBV for Review
class ReviewListCreateView(generics.ListCreateAPIView):
    
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Get the assignment_id from the URL
        assignment_id = self.kwargs.get('assignment_id')
        # Filter submissions by the assignment ID
        return Review.objects.filter(assignment_id=assignment_id)

    def perform_create(self, serializer):
        assignment_id = self.kwargs.get('assignment_id')
        assignment = get_object_or_404(Assignment, id=assignment_id)
        serializer.save(reviewer=self.request.user, assignment=assignment)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

class IterationReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        assignment = get_object_or_404(Assignment, pk=pk)
        reviews = Review.objects.filter(assignment=assignment).order_by('iteration_number')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

# CBV for Comment
class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

# CBV for Profile
class ProfileListCreateView(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class ReviewHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        profile = get_object_or_404(Profile, pk=pk)
        return Response({"review_history": profile.review_history})

class SubmissionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        profile = get_object_or_404(Profile, pk=pk)
        return Response({"submission_history": profile.submission_history})

# Create your views here.
