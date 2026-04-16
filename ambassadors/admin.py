from django.contrib import admin
from .models import Ambassador

@admin.action(description="Approve selected ambassadors")
def approve_ambassadors(modeladmin, request, queryset):
    queryset.update(status='approved')

@admin.action(description="Reject selected ambassadors")
def reject_ambassadors(modeladmin, request, queryset):
    queryset.update(status='rejected')

@admin.register(Ambassador)
class AmbassadorAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'status', 'created_at')
    list_filter = ('status', 'city')
    search_fields = ('name', 'email')
    actions = [approve_ambassadors, reject_ambassadors]
