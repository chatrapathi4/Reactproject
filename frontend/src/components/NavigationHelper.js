import { useNavigate } from 'react-router-dom';

export const useNavigateToSection = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionId) => {
    // Navigate to home page first
    navigate('/', { replace: true });
    
    // Wait for navigation to complete, then scroll to section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return navigateToSection;
};