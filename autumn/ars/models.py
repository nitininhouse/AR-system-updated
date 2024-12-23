
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import PermissionsMixin,AbstractBaseUser, BaseUserManager
from ars.managers import UserManager 
import os

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    password = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)


    objects = UserManager()
    REQUIRED_FIELDS = ['email']
    USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username

    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True

    def set_password(self, raw_password):
        """
        Hash the raw password and store it in the password field.
        """
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """
        Check the provided password against the hashed password stored.
        """
        return check_password(raw_password, self.password)

class Role(models.Model):
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('reviewer', 'Reviewer'),
        ('reviewee', 'Reviewee'),
    )
    role_name = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return self.role_name


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.role.role_name}"


class Team(models.Model):
    team_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teams_created")
    members = models.JSONField(default=list, blank=True)  
    
    def __str__(self):
        return self.team_name

def assignment_upload_path(instance, filename):
    return os.path.join('assignments', instance.created_by.username, filename)
class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments_created')
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    due_date = models.DateField(default='2024-12-31')
 
    file = models.FileField(upload_to=assignment_upload_path, blank=True, null=True)  # File upload
    reviewers = models.ManyToManyField(User, related_name='assignments_reviewing', blank=True)


    def __str__(self):
        return self.title

class SubTask(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title


class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    attachment = models.URLField(max_length=200, null=True, blank=True) # Field to hold the assignment link
    comments = models.TextField(blank=True, null=True)
    submission_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.submitted_by.username} for {self.assignment.title}"




class Review(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    iteration_number = models.PositiveIntegerField()
    comments = models.TextField(blank=True, null=True)
    review_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10,  choices=STATUS_CHOICES)

    def __str__(self):
        return f"Review of {self.assignment.title} by {self.reviewer.username} (Iteration {self.iteration_number})"



class Comment(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='review_comments')  
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.created_by.username} on {self.review}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    review_history = models.TextField(blank=True, null=True)  
    submission_history = models.TextField(blank=True, null=True)  
    pending_reviews = models.PositiveIntegerField(default=0)
    in_progress_assignments = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Profile of {self.user.username}"

