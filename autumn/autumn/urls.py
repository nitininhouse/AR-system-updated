
from django.contrib import admin

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from ars.serializers import CustomTokenObtainPairSerializer

from ars.views import google_login


from django.urls import path, include
from ars.views import (
    UserListCreateView, UserDetailView, UserRoleListCreateView, UserRoleDetailView, RoleListCreateView, RoleDetailView,
    TeamListCreateView, TeamDetailView, TeamAssignmentsView,
    AssignmentListCreateView, AssignmentDetailView, SubTaskListCreateView,
    SubTaskDetailView, AssignmentSubTasksView, SubmissionListCreateView,
    SubmissionDetailView,  ReviewListCreateView, ReviewDetailView,
    IterationReviewsView, CommentListCreateView, CommentDetailView,
    ProfileListCreateView, ProfileDetailView, ReviewHistoryView, SubmissionHistoryView, google_login
)
from ars.views import RegisterUserView
from ars.views import AssignmentDetailByIDView
from ars.views import AssignmentReviewersView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
     path('register/', RegisterUserView.as_view(), name='register_user'),
    

    path('userrole/', UserRoleListCreateView.as_view(), name='userrole-list-create'),
    path('userrole/<int:pk>/', UserRoleDetailView.as_view(), name='userrole-detail'),


    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    
    path('teams/', TeamListCreateView.as_view(), name='team-list-create'),
    path('teams/<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('members/<int:member_id>/assignments/', TeamAssignmentsView.as_view(), name='member-assignments'),

    
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('assignments/reviewer/<int:reviewer_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('assignments/<int:id>/', AssignmentDetailByIDView.as_view(), name='assignment-detail'),
    path('assignments/<int:pk>/reviewers/', AssignmentReviewersView.as_view(), name='assignment-reviewers'),
    
    path('subtasks/', SubTaskListCreateView.as_view(), name='subtask-list-create'),
    path('subtasks/<int:pk>/', SubTaskDetailView.as_view(), name='subtask-detail'),
    path('assignments/<int:pk>/subtasks/', AssignmentSubTasksView.as_view(), name='assignment-subtasks'),
    
    path('assignments/<int:assignment_id>/submissions/', SubmissionListCreateView.as_view(), name='submission-list-create'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),

    
    path('assignments/<int:assignment_id>/reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('assignments/<int:pk>/reviews/', IterationReviewsView.as_view(), name='iteration-reviews'),
    
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    
    path('profiles/', ProfileListCreateView.as_view(), name='profile-list-create'),
    path('profiles/<int:pk>/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profiles/<int:pk>/review_history/', ReviewHistoryView.as_view(), name='review-history'),
    path('profiles/<int:pk>/submission_history/', SubmissionHistoryView.as_view(), name='submission-history'),

    path('api/token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('accounts/', include('allauth.urls')),
    path('api/google-login/', google_login, name='google_login'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



