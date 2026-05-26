/**
 * COESO - Concreto • Estrutura • Obras
 * Script de Interações e Comportamentos Dinâmicos
 * Author: Antigravity AI
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Menu Mobile Hambúrguer ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fechar menu mobile ao clicar em um link de âncora
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- 2. Efeito Dinâmico de Scroll no Header ---
    const header = document.querySelector('.header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(6, 11, 26, 0.96)';
            header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
            header.style.height = '4.75rem';
        } else {
            header.style.backgroundColor = 'rgba(6, 11, 26, 0.85)';
            header.style.boxShadow = 'none';
            header.style.height = '5.5rem';
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Executar verificação inicial ao carregar a página

    // --- 3. Efeito de Entrada Suave sob Scroll (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Deixa de rastrear após animar
                }
            });
        }, {
            threshold: 0.05, // Disparar com apenas 5% do elemento em tela (evita elementos grandes nunca ativarem)
            rootMargin: '0px 0px 0px 0px' // Sem offset inferior para garantir ativação confiável
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback rápido para navegadores obsoletos sem suporte
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }

    // --- 4. Scroll Lento e Personalizado para Projetos ---
    const btnProjetos = document.querySelector('.btn-scroll-projetos');
    if (btnProjetos) {
        btnProjetos.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#obras');
            if (target) {
                slowScrollTo(target, 2200); // 2.2 segundos de duração (rolagem suave e devagar)
            }
        });
    }

    function slowScrollTo(targetElement, duration) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80; // Desconto da barra superior
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // --- 5. Lógica do Carrossel de Frota Operacional ---
    const track = document.getElementById('frota-track');
    const prevBtn = document.getElementById('frota-prev');
    const nextBtn = document.getElementById('frota-next');
    const dotsContainer = document.getElementById('frota-dots');
    const cards = Array.from(track ? track.querySelectorAll('.equipamento-card') : []);

    if (track && prevBtn && nextBtn && dotsContainer && cards.length > 0) {
        let currentPage = 0;
        let itemsPerPage = getItemsPerPage();
        let totalPages = Math.ceil(cards.length / itemsPerPage);

        // Lógica de arrasto/swipe
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        const dragThreshold = 80; // px para acionar a mudança de slide

        // Inicializar
        updateCarousel();
        setupDots();

        // Escutadores de eventos de clique nos botões
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updateCarousel();
            }
        });

        // Escutadores do resize com debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newItemsPerPage = getItemsPerPage();
                if (newItemsPerPage !== itemsPerPage) {
                    itemsPerPage = newItemsPerPage;
                    totalPages = Math.ceil(cards.length / itemsPerPage);
                    // Ajustar a página atual se estourar o novo limite de páginas
                    if (currentPage >= totalPages) {
                        currentPage = totalPages - 1;
                    }
                    setupDots();
                }
                updateCarousel();
            }, 100);
        });

        // Funções Auxiliares
        function getItemsPerPage() {
            const width = window.innerWidth;
            if (width >= 992) return 3;
            if (width >= 600) return 2;
            return 1;
        }

        function setupDots() {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === currentPage) dot.classList.add('active');
                dot.setAttribute('aria-label', `Ir para página ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentPage = i;
                    updateCarousel();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateCarousel() {
            const gap = parseFloat(getComputedStyle(track).gap) || 40;
            const containerWidth = track.parentElement.getBoundingClientRect().width;
            const cardWidth = cards[0].getBoundingClientRect().width;
            
            // O deslocamento será baseado em avançar as páginas
            let finalOffset = currentPage * itemsPerPage * (cardWidth + gap);
            
            // Se for a última página, ajustamos para não exibir espaço vazio se sobrar cards
            if (currentPage === totalPages - 1 && cards.length % itemsPerPage !== 0) {
                const totalCardsOffset = (cards.length - itemsPerPage) * (cardWidth + gap);
                finalOffset = totalCardsOffset;
            }

            track.style.transform = `translateX(-${finalOffset}px)`;

            // Atualizar estado das setas
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage === totalPages - 1;

            // Atualizar dots
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                if (index === currentPage) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Atualizar posições de translate para arrasto
            prevTranslate = -finalOffset;
            currentTranslate = prevTranslate;
        }

        // --- Suporte a Gesto de Deslizar (Swipe e Drag) ---
        // Adicionar eventos para Mouse
        track.addEventListener('mousedown', dragStart);
        track.addEventListener('mouseup', dragEnd);
        track.addEventListener('mouseleave', dragEnd);
        track.addEventListener('mousemove', dragAction);

        // Adicionar eventos para Touch
        track.addEventListener('touchstart', dragStart, { passive: true });
        track.addEventListener('touchend', dragEnd);
        track.addEventListener('touchmove', dragAction, { passive: true });

        // Impedir que imagens sejam arrastadas nativamente no navegador (interferindo no drag)
        track.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        function dragStart(e) {
            isDragging = true;
            startX = getPositionX(e);
            track.style.transition = 'none'; // Desabilita transição durante arrasto
            animationID = requestAnimationFrame(animation);
            
            // Evitar seleção de textos e imagens no arrasto por mouse
            if (e.type === 'mousedown') {
                e.preventDefault();
                track.style.cursor = 'grabbing';
            }
        }

        function dragAction(e) {
            if (!isDragging) return;
            const currentX = getPositionX(e);
            const diffX = currentX - startX;
            currentTranslate = prevTranslate + diffX;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            cancelAnimationFrame(animationID);
            track.style.cursor = 'grab';
            track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

            const movedBy = currentTranslate - prevTranslate;

            // Se arrastou o suficiente para a esquerda e tem páginas à frente
            if (movedBy < -dragThreshold && currentPage < totalPages - 1) {
                currentPage++;
            }
            // Se arrastou o suficiente para a direita e tem páginas atrás
            else if (movedBy > dragThreshold && currentPage > 0) {
                currentPage--;
            }

            updateCarousel();
        }

        function getPositionX(e) {
            return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        }

        function animation() {
            if (isDragging) {
                track.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }

        // Definir cursor padrão inicial
        track.style.cursor = 'grab';
    }

    // --- 6. Efeito Hover 3D Dinâmico (Paralaxe Giroscópico) do Livro de Catálogo ---
    const catalogWrapper = document.querySelector('.catalogo-mockup-wrapper');
    const catalogBook = document.getElementById('catalogo-book');

    if (catalogWrapper && catalogBook) {
        catalogWrapper.addEventListener('mousemove', (e) => {
            const rect = catalogWrapper.getBoundingClientRect();
            // Posição relativa do mouse dentro da área de mockup (-0.5 a 0.5)
            const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
            const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

            // Rotação máxima desejada
            const maxRotateY = 35; // Ângulo máximo de giro horizontal
            const maxRotateX = 25; // Ângulo máximo de inclinação vertical

            // Rotação calculada a partir da posição (posição de descanso é rotateY(-18deg) rotateX(10deg))
            // Somamos a rotação base às rotações de paralaxe
            const targetRotateY = -18 + (mouseX * maxRotateY);
            const targetRotateX = 10 - (mouseY * maxRotateX);

            // Aplicar transformação tridimensional
            catalogBook.style.transition = 'transform 0.1s ease'; // Transição extremamente rápida e reativa no mousemove
            catalogBook.style.transform = `rotateY(${targetRotateY}deg) rotateX(${targetRotateX}deg) translateZ(10px)`;
        });

        // Restaurar estado padrão de descanso suavemente no mouseleave
        catalogWrapper.addEventListener('mouseleave', () => {
            catalogBook.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            catalogBook.style.transform = 'rotateY(-18deg) rotateX(10deg) translateZ(0px)';
        });
    }



    // --- 8. Lógica dos Carrosséis Dinâmicos do Catálogo de Produtos ---
    const productCarousels = document.querySelectorAll('[data-carousel]');

    productCarousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const btnPrev = carousel.querySelector('.carousel-btn.prev');
        const btnNext = carousel.querySelector('.carousel-btn.next');
        const dotsContainer = carousel.querySelector('.carousel-dots');

        // Se tiver apenas 1 slide, ocultamos controles
        if (slides.length <= 1) {
            if (btnPrev) btnPrev.style.display = 'none';
            if (btnNext) btnNext.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return; // Encerra, pois não precisa de navegação
        }

        let currentIndex = 0;

        // Limpar dots existentes e preencher dinamicamente para garantir sincronia exata
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (idx === 0) dot.classList.add('active');
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(idx);
                });
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

        function goToSlide(index) {
            // Garantir limites circulares
            if (index < 0) {
                currentIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            // Mover a trilha de imagens
            if (track) {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            // Sincronizar dots
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        // Adicionar escutadores para os botões Anterior/Próximo
        if (btnPrev) {
            btnPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentIndex - 1);
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentIndex + 1);
            });
        }

        // --- Suporte a gesto de deslizar (Swipe) para carrosséis do catálogo ---
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50; // pixels mínimos de deslocamento
            if (touchStartX - touchEndX > threshold) {
                // Swipe para a esquerda -> próximo slide
                goToSlide(currentIndex + 1);
            } else if (touchEndX - touchStartX > threshold) {
                // Swipe para a direita -> slide anterior
                goToSlide(currentIndex - 1);
            }
        }
    });

    // --- 9. Accordion da Seção FAQ ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon i');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Fechar todas as outras perguntas abertas (efeito sanfona premium)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        const otherIcon = otherItem.querySelector('.faq-icon i');
                        if (otherIcon) {
                            otherIcon.className = 'fa-solid fa-plus';
                        }
                    }
                });

                // Toggle da pergunta atual
                if (isOpen) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                    question.setAttribute('aria-expanded', 'false');
                    if (icon) icon.className = 'fa-solid fa-plus';
                } else {
                    item.classList.add('active');
                    // max-height com scrollHeight garante animação CSS suave
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    question.setAttribute('aria-expanded', 'true');
                    if (icon) icon.className = 'fa-solid fa-minus';
                }
            });
        }
    });

    // --- 10. Slider Interativo da Seção de História (Nossa Trajetória) ---
    const historiaSlider = document.querySelector('.historia-slider');
    if (historiaSlider) {
        const slides = historiaSlider.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dots .dot');
        const btnPrev = document.querySelector('.slider-btn.prev-btn');
        const btnNext = document.querySelector('.slider-btn.next-btn');
        let currentHistoryIndex = 0;
        let historySlideInterval;

        function showHistorySlide(index) {
            if (index < 0) {
                currentHistoryIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentHistoryIndex = 0;
            } else {
                currentHistoryIndex = index;
            }

            slides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentHistoryIndex);
            });

            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentHistoryIndex);
            });
        }

        function nextHistorySlide() {
            showHistorySlide(currentHistoryIndex + 1);
        }

        function prevHistorySlide() {
            showHistorySlide(currentHistoryIndex - 1);
        }

        function startHistoryAutoPlay() {
            stopHistoryAutoPlay();
            historySlideInterval = setInterval(nextHistorySlide, 5000); // transição automática a cada 5s
        }

        function stopHistoryAutoPlay() {
            if (historySlideInterval) {
                clearInterval(historySlideInterval);
            }
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevHistorySlide();
                startHistoryAutoPlay();
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextHistorySlide();
                startHistoryAutoPlay();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showHistorySlide(idx);
                startHistoryAutoPlay();
            });
        });

        // Suporte a swipe de toque (telas móveis)
        let touchStartX = 0;
        let touchEndX = 0;

        historiaSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        historiaSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) {
                nextHistorySlide();
                startHistoryAutoPlay();
            } else if (touchEndX - touchStartX > threshold) {
                prevHistorySlide();
                startHistoryAutoPlay();
            }
        }

        // Iniciar
        startHistoryAutoPlay();
    }

    // --- 11. Lógica do Carrossel de Soluções (Página Inicial) ---
    const solucoesTrack = document.getElementById('solucoes-track');
    const solucoesPrev = document.getElementById('solucoes-prev');
    const solucoesNext = document.getElementById('solucoes-next');
    const solucoesDots = document.getElementById('solucoes-dots');
    const solucoesCards = Array.from(solucoesTrack ? solucoesTrack.querySelectorAll('.card-solucao') : []);

    if (solucoesTrack && solucoesPrev && solucoesNext && solucoesDots && solucoesCards.length > 0) {
        let currentSolucoesPage = 0;
        let solucoesItemsPerPage = getSolucoesItemsPerPage();
        let totalSolucoesPages = Math.ceil(solucoesCards.length / solucoesItemsPerPage);

        updateSolucoesCarousel();
        setupSolucoesDots();

        solucoesPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentSolucoesPage > 0) {
                currentSolucoesPage--;
                updateSolucoesCarousel();
            }
        });

        solucoesNext.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentSolucoesPage < totalSolucoesPages - 1) {
                currentSolucoesPage++;
                updateSolucoesCarousel();
            }
        });

        let solucoesResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(solucoesResizeTimeout);
            solucoesResizeTimeout = setTimeout(() => {
                const newItemsPerPage = getSolucoesItemsPerPage();
                if (newItemsPerPage !== solucoesItemsPerPage) {
                    solucoesItemsPerPage = newItemsPerPage;
                    totalSolucoesPages = Math.ceil(solucoesCards.length / solucoesItemsPerPage);
                    if (currentSolucoesPage >= totalSolucoesPages) {
                        currentSolucoesPage = totalSolucoesPages - 1;
                    }
                    setupSolucoesDots();
                }
                updateSolucoesCarousel();
            }, 100);
        });

        function getSolucoesItemsPerPage() {
            return window.innerWidth >= 992 ? 2 : 1;
        }

        function setupSolucoesDots() {
            solucoesDots.innerHTML = '';
            for (let i = 0; i < totalSolucoesPages; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === currentSolucoesPage) dot.classList.add('active');
                dot.setAttribute('aria-label', `Ir para página ${i + 1}`);
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentSolucoesPage = i;
                    updateSolucoesCarousel();
                });
                solucoesDots.appendChild(dot);
            }
        }

        function updateSolucoesCarousel() {
            const gap = parseFloat(getComputedStyle(solucoesTrack).gap) || 40;
            const cardWidth = solucoesCards[0].getBoundingClientRect().width;
            
            let finalOffset = currentSolucoesPage * solucoesItemsPerPage * (cardWidth + gap);
            
            // Se for a última página, ajustamos para não passar do limite de itens
            if (currentSolucoesPage === totalSolucoesPages - 1) {
                const maxOffset = (solucoesCards.length - solucoesItemsPerPage) * (cardWidth + gap);
                if (finalOffset > maxOffset) {
                    finalOffset = maxOffset;
                }
            }

            // Aplicar deslocamento
            solucoesTrack.style.transform = `translateX(-${finalOffset}px)`;

            // Atualizar status dos botões
            solucoesPrev.disabled = currentSolucoesPage === 0;
            solucoesNext.disabled = currentSolucoesPage === totalSolucoesPages - 1;

            // Atualizar dots
            const dots = Array.from(solucoesDots.querySelectorAll('.carousel-dot'));
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSolucoesPage);
            });
        }

        // Suporte a gestos de deslizar (Swipe) para telas de toque
        let swipeStartX = 0;
        let swipeEndX = 0;

        solucoesTrack.addEventListener('touchstart', (e) => {
            swipeStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        solucoesTrack.addEventListener('touchend', (e) => {
            swipeEndX = e.changedTouches[0].screenX;
            handleSolucoesSwipe();
        }, { passive: true });

        function handleSolucoesSwipe() {
            const threshold = 50;
            if (swipeStartX - swipeEndX > threshold && currentSolucoesPage < totalSolucoesPages - 1) {
                currentSolucoesPage++;
                updateSolucoesCarousel();
            } else if (swipeEndX - swipeStartX > threshold && currentSolucoesPage > 0) {
                currentSolucoesPage--;
                updateSolucoesCarousel();
            }
        }
    }

    // --- 12. Slider de Imagens da Seção Quem Somos (Equipe) ---
    const equipeSlider = document.getElementById('equipe-slider');
    if (equipeSlider) {
        const slides = equipeSlider.querySelectorAll('.equipe-slide');
        const prevBtn = document.getElementById('equipe-prev');
        const nextBtn = document.getElementById('equipe-next');
        const dotsContainer = document.getElementById('equipe-dots');
        let currentSlideIndex = 0;
        let slideInterval;

        // Gerar dots dinamicamente
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (idx === 0) dot.classList.add('active');
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSlide(idx);
                    startAutoPlay();
                });
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

        function showSlide(index) {
            if (index < 0) {
                currentSlideIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentSlideIndex = 0;
            } else {
                currentSlideIndex = index;
            }

            slides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentSlideIndex);
            });

            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlideIndex);
            });
        }

        function nextSlide() {
            showSlide(currentSlideIndex + 1);
        }

        function prevSlide() {
            showSlide(currentSlideIndex - 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            slideInterval = setInterval(nextSlide, 5000); // muda a cada 5 segundos
        }

        function stopAutoPlay() {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
                startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
                startAutoPlay();
            });
        }

        // Swipe de Toque para Mobile
        let touchStartX = 0;
        let touchEndX = 0;

        equipeSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        equipeSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) {
                nextSlide();
                startAutoPlay();
            } else if (touchEndX - touchStartX > threshold) {
                prevSlide();
                startAutoPlay();
            }
        }

        // Iniciar Autoplay
        startAutoPlay();
    }
});

