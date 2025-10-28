document.addEventListener('DOMContentLoaded', () => {

    /* ----- Menu Mobile Toggle ----- */
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    /* ----- Header Fixo e Links Ativos ----- */
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('#nav a');
    const sections = document.querySelectorAll('main section');

    const updateActiveLink = () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const offset = 100; // Pequeno offset para a mudança de link ocorrer um pouco antes

            if (window.scrollY >= sectionTop - offset) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.endsWith(`#${currentSectionId}`)) {
                link.classList.add('active');
            }
        });
    };

    const handleScroll = () => {
        updateActiveLink();
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Garante o estado inicial correto

    /* ----- Calendário de Agendamento ----- */
    const monthYearElement = document.getElementById('month-year');
    const datesElement = document.getElementById('dates');
    const availableTimesElement = document.getElementById('available-times');
    const prevMonthBtn = document.querySelector('.calendar-header .nav-btn:first-of-type');
    const nextMonthBtn = document.querySelector('.calendar-header .nav-btn:last-of-type');

    let currentDate = new Date(); // Data atual para o calendário

    // Horários de atendimento (exemplo)
    const getAvailableTimes = (date) => {
        const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera hora para comparação de data
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        let times = [];
        // Atendimento de Segunda a Sexta, das 09:00 às 17:00
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            for (let h = 9; h < 17; h++) {
                // Adiciona horários inteiros
                let time1 = `${String(h).padStart(2, '0')}:00`;
                let timeObj1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 0);
                if (selectedDateOnly.getTime() !== today.getTime() || timeObj1.getTime() > new Date().getTime()) {
                    times.push(time1);
                }

                // Adiciona horários de meia hora
                let time2 = `${String(h).padStart(2, '0')}:30`;
                let timeObj2 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 30);
                if (selectedDateOnly.getTime() !== today.getTime() || timeObj2.getTime() > new Date().getTime()) {
                    times.push(time2);
                }
            }
        }
        return times;
    };


    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0 = Janeiro, 11 = Dezembro

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        monthYearElement.textContent = `${monthNames[month]} ${year}`;
        datesElement.innerHTML = ''; // Limpa datas anteriores

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDateOfMonth = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay(); // Dia da semana do primeiro dia do mês (0=Domingo)

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera a hora para comparação de datas

        // Preenche com dias vazios antes do primeiro dia do mês
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('date-item', 'disabled'); // Dias vazios são desabilitados
            datesElement.appendChild(emptyDiv);
        }

        // Cria os divs para cada dia do mês
        for (let day = 1; day <= lastDateOfMonth.getDate(); day++) {
            const dateItem = document.createElement('div');
            dateItem.classList.add('date-item');
            dateItem.textContent = day;
            const currentDayDate = new Date(year, month, day);
            currentDayDate.setHours(0, 0, 0, 0); // Zera a hora para comparação

            // Desabilita dias passados e fins de semana
            if (currentDayDate < today || currentDayDate.getDay() === 0 || currentDayDate.getDay() === 6) {
                 dateItem.classList.add('disabled');
            } else {
                dateItem.addEventListener('click', () => {
                    selectDate(new Date(year, month, day)); // Passa a data completa
                });
            }
            datesElement.appendChild(dateItem);
        }
    };

    const selectDate = (date) => {
        // Remove a seleção anterior de data
        document.querySelectorAll('.date-item.selected').forEach(item => item.classList.remove('selected'));

        // Encontra e marca o dia selecionado (precisa do dia e do mês/ano para ser único)
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.getMonth();

        const allDateItems = datesElement.querySelectorAll('.date-item:not(.disabled)');
        allDateItems.forEach(item => {
            // Este é um método mais robusto para encontrar a célula do dia
            const itemDay = parseInt(item.textContent);
            // Reconstruir a data para o item para ter certeza da correspondência
            const itemDate = new Date(year, month, itemDay);
            itemDate.setHours(0,0,0,0);

            if (itemDate.getTime() === date.getTime()) {
                item.classList.add('selected');
            }
        });


        // Exibe os horários disponíveis para o dia selecionado
        const times = getAvailableTimes(date);
        availableTimesElement.innerHTML = ''; // Limpa horários anteriores
        if (times.length > 0) {
            times.forEach(time => {
                const timeSlot = document.createElement('span');
                timeSlot.classList.add('time-slot');
                timeSlot.textContent = time;
                timeSlot.addEventListener('click', () => selectTime(timeSlot));
                availableTimesElement.appendChild(timeSlot);
            });
        } else {
            const noTimeMessage = document.createElement('p');
            noTimeMessage.textContent = "Nenhum horário disponível para este dia ou dia de final de semana.";
            availableTimesElement.appendChild(noTimeMessage);
        }
    };

    const selectTime = (timeSlotElement) => {
        // Remove a seleção anterior de horário
        document.querySelectorAll('.time-slot.selected').forEach(slot => slot.classList.remove('selected'));
        // Marca o horário selecionado
        timeSlotElement.classList.add('selected');
    };


    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        availableTimesElement.innerHTML = ''; // Limpa horários ao mudar de mês
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        availableTimesElement.innerHTML = ''; // Limpa horários ao mudar de mês
    });

    renderCalendar(); // Chama a função para exibir o calendário inicial


    /* ----- FAQs Interativas (Acordeão) ----- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const faqQuestion = item.querySelector('.faq-question'); // Use o faq-question como gatilho
        const faqToggle = item.querySelector('.faq-toggle');
        const faqAnswer = item.querySelector('.faq-answer');

        faqQuestion.addEventListener('click', () => { // O clique na pergunta inteira ativa
            const isActive = item.classList.toggle('active');

            if (isActive) {
                faqToggle.textContent = '✕'; // 'x' mais minimalista, ou '×' unicode
            } else {
                faqToggle.textContent = '+';
            }
        });
    });


    /* ----- Envio de Formulário para WhatsApp ----- */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const mensagem = document.getElementById('mensagem').value;

            // IMPORTANTE: Substitua pelo seu número de telefone com código do país e DDD
            const whatsappNumber = '55XXXXXXXXXXX'; // Exemplo: 5511999999999
            const message = `Olá, Dalila! Meu nome é ${nome}. Gostaria de entrar em contato sobre: ${mensagem}. Meu email é ${email}.`;
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');
        });
    }
});

// Função para abrir o WhatsApp com os dados do agendamento
function openWhatsApp() {
    let selectedDate = null;
    let selectedTime = null;

    // Encontra a data selecionada
    const selectedDateItem = document.querySelector('.date-item.selected');
    if (selectedDateItem) {
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const monthYearText = document.getElementById('month-year').textContent.split(' ');
        const monthName = monthYearText[0];
        const year = parseInt(monthYearText[1]);
        const monthIndex = monthNames.indexOf(monthName);
        const day = parseInt(selectedDateItem.textContent);
        selectedDate = new Date(year, monthIndex, day);
    }

    // Encontra o horário selecionado
    const selectedTimeSlot = document.querySelector('.time-slot.selected');
    if (selectedTimeSlot) {
        selectedTime = selectedTimeSlot.textContent;
    }

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');

    const nome = nomeInput ? nomeInput.value : 'Não informado';
    const email = emailInput ? emailInput.value : 'Não informado';


    if (!selectedDate || !selectedTime) {
        alert("Por favor, selecione uma data e um horário antes de confirmar o agendamento.");
        return;
    }

    const formattedDate = selectedDate.toLocaleDateString('pt-BR');
    const whatsappNumber = '55XXXXXXXXXXX'; // Substitua pelo seu número de telefone
    let message = `Olá, Dalila! Gostaria de agendar uma sessão.\n\n`;
    message += `Nome: ${nome}\n`;
    message += `Email: ${email}\n`;
    message += `Data: ${formattedDate}\n`;
    message += `Horário: ${selectedTime}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}