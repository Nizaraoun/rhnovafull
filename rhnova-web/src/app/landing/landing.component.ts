import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {

  constructor(private elementRef: ElementRef) {}
  
  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    this.animateCounters();
    this.initIntersectionObserver();
  }

  // Statistics data
  statistics = [
    { number: '500+', label: 'Offres d\'emploi' },
    { number: '300+', label: 'Entreprises inscrites' },
    { number: '2000+', label: 'Candidats actifs' }
  ];

  // Features for different user types
  hrFeatures = [
    { icon: '📝', title: 'Publier des offres d\'emploi', description: 'Créez et publiez vos offres d\'emploi facilement' },
    { icon: '👥', title: 'Suivre les candidatures', description: 'Gérez et suivez toutes vos candidatures en temps réel' },
    { icon: '📅', title: 'Planifier des entretiens', description: 'Organisez vos entretiens avec un système de planification intégré' }
  ];

  candidateFeatures = [
    { icon: '👤', title: 'Créer un profil', description: 'Construisez un profil professionnel attractif' },
    { icon: '📄', title: 'Déposer un CV', description: 'Téléchargez et gérez vos CVs en toute simplicité' },
    { icon: '🔍', title: 'Postuler en un clic', description: 'Postulez rapidement aux offres qui vous intéressent' }
  ];

  managerFeatures = [
    { icon: '📊', title: 'Suivre les tâches d\'équipe', description: 'Visualisez l\'avancement des projets en temps réel' },
    { icon: '🎯', title: 'Affecter les missions', description: 'Distribuez efficacement les tâches à vos équipes' },
    { icon: '⭐', title: 'Évaluer les performances', description: 'Évaluez et suivez les performances de vos collaborateurs' }
  ];

  // How it works steps
  steps = [
    { 
      number: '01', 
      title: 'Créez un compte', 
      description: 'Inscrivez-vous en quelques minutes selon votre profil' 
    },
    { 
      number: '02', 
      title: 'Trouvez ou publiez une offre', 
      description: 'Recherchez des opportunités ou publiez vos besoins' 
    },
    { 
      number: '03', 
      title: 'Postulez ou gérez vos équipes', 
      description: 'Commencez à collaborer et à faire grandir votre activité' 
    }
  ];

  // Testimonials
  testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Responsable RH, TechCorp',
      content: 'Une plateforme exceptionnelle qui a révolutionné notre processus de recrutement. Nous avons trouvé des talents de qualité en un temps record.',
      avatar: '👩‍💼'
    },
    {
      name: 'Ahmed Ben Ali',
      role: 'Développeur Full Stack',
      content: 'Grâce à cette plateforme, j\'ai trouvé le poste de mes rêves en seulement 2 semaines. L\'interface est intuitive et les offres sont de qualité.',
      avatar: '👨‍💻'
    },
    {
      name: 'Sophie Martin',
      role: 'Chef de Projet, InnovTech',
      content: 'L\'outil de gestion d\'équipe est fantastique. Je peux suivre tous mes projets et optimiser les performances de mon équipe facilement.',
      avatar: '👩‍💼'
    }
  ];

  scrollToSection(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Animate counter numbers
  private animateCounters() {
    const counters = this.elementRef.nativeElement.querySelectorAll('[data-count]');
    
    counters.forEach((counter: HTMLElement) => {
      const target = parseInt(counter.getAttribute('data-count') || '0');
      const increment = target / 100;
      let current = 0;
      
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = Math.ceil(current).toString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toString();
        }
      };
      
      // Start animation when element comes into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(counter);
    });
  }

  // Initialize intersection observer for animations
  private initIntersectionObserver() {
    const animatedElements = this.elementRef.nativeElement.querySelectorAll('.animate-fade-in, .animate-slide-up');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach((el: Element) => {
      observer.observe(el);
    });
  }
}
