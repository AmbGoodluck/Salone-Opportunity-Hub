from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .models import Ambassador
from .forms import AmbassadorApplicationForm
from django.db.models import Q

def apply_ambassador(request):
    if request.method == 'POST':
        form = AmbassadorApplicationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('ambassadors:success')
    else:
        form = AmbassadorApplicationForm()
    return render(request, 'ambassadors/apply.html', {'form': form})

def application_success(request):
    return render(request, 'ambassadors/success.html')

def ambassador_list(request):
    query = request.GET.get('q', '')
    ambassadors = Ambassador.objects.filter(status='approved')
    if query:
        ambassadors = ambassadors.filter(
            Q(name__icontains=query) | Q(city__icontains=query)
        )
    return render(request, 'ambassadors/list.html', {'ambassadors': ambassadors, 'query': query})

def ambassador_detail(request, slug):
    ambassador = get_object_or_404(Ambassador, slug=slug, status='approved')
    return render(request, 'ambassadors/detail.html', {'ambassador': ambassador})
