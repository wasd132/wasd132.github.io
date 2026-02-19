$(document).ready(() => {
    render_projects('security');
})


let render_projects = (slug) => {
    let projects_area = $('.projects-wrapper');

    $('.white-button').removeClass('white-button-hover');
    $(`#${slug}`).addClass('white-button-hover');

    let projects_obj = [
        {
            image: 'assets/images/mentors.jpg',
            link: 'projects/blind-project/',
            title: 'Blind project',
            demo: 'https://github.com/KunsanDADLab/BlindProject/tree/main',
            technologies: ['Yolov5', 'CVAT', 'Python'],
            description: "시각장애인을 위한 보행 보조장치입니다. Yolov5를 사용하여 장애인의 주변 환경을 인식하고, 사용자에게 경고를 제공합니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/mobile-landscape.jpg',
            link: 'projects/mosquito-solution/',
            title: '태양광 기반 세종시 모기 퇴치 솔루션',
            demo: false,
            technologies: ['Yolov5', 'python','Raspberry PI'],
            description: "태양광과 Raspberry PI, Yolov5를 활용한 해충 방제 프로젝트입니다. 특정 위치에 말라리아등의 매개가 되는 모기가 다량 발생 시 이를 탐지하여 방제에 도움이 될 수 있도록 합니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/mpw.jpg',
            link: 'projects/pe-analyzer/',
            title: 'PE-A(Analyzer)',
            demo: 'https://github.com/ultisy/PE-A',
            technologies: ['Python', 'Qt Designer'],
            description: "PE뷰어 프로젝트 입니다. 기능별로 파편화된 도구들을 통합하여 초보자도 손쉽게 파일포멧을 분석 할 수 있는 프로그램 입니다.",
            categories: ['security']
        },
        {
            image: 'assets/images/raspberry-pi-monitor.png',
            link: 'projects/ecommerce-recommendation/',
            title: '이커머스 데이터 기반 개인화 추천 시스템 설계 및 구현',
            demo: false,
            technologies: ['python', 'APriori', 'LTR'],
            description: "Apriori 알고리즘과 LTR(Learning to Rank)을 활용하여 구매자를 위한 상품 추천 시스템을 구축했습니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/s3scan.png',
            link: 'projects/blp-kernel-module/',
            title: '접근통제 정책 집행을 위한 리눅스 커널 모듈 개발',
            demo: false,
            technologies: ['C','python' ,'Linux', ],
            description: "BLP모델을 기반으로 한 리눅스 보안 모듈입니다. 사용자의 보안레벨에 따라 파일의 읽기/쓰기 접근을 커널 수준에서 제어합니다.",
            categories: ['security']
        },
        {
            image: 'assets/images/google-cloud-backup.png',
            link: 'projects/mitre-attack-siem/',
            title: 'MITRE ATT&CK 기반 지능형 침해사고 분석 및 자동 대응 시스템 구축',
            demo: false,
            technologies: ['Wazuh', 'Falco', 'Shuffle', 'python','Docker'],
            description: "시스템 콜 기반 행위 탐지와 MITRE TTP 매핑을 통해 위협을 정량화하고, SOAR를 활용한 자동 대응까지 구현한 통합 보안 아키텍처를 구현했습니다.",
            categories: ['security']
        },
    ]

    let projects = [];
    if(slug == 'all') {
        projects = projects_obj.map(project_mapper);
    } 
    else {
        projects = projects_obj.filter(project => project.categories.includes(slug)).map(project_mapper);
    }
    projects_area.hide().html(projects).fadeIn();
}

let project_mapper = project => {
    return `
        <div class="wrapper">
                
            <div class="card radius shadowDepth1">

                ${project.image ? 
                    `<div class="card__image border-tlr-radius">
                        <a href="${project.link}">
                            <img src="${project.image}" alt="image" id="project-image" class="border-tlr-radius">
                        </a>
                    </div>`           
                : ''}

        
                <div class="card__content card__padding">
        
                    <article class="card__article">
                        <h2><a href="${project.link}">${project.title}</a></h2>
        
                        <p class="paragraph-text-normal">${project.description} ${project.demo ? `<a href="${project.demo}">GitHub</a>` : ''}</p>
                    </article>

                                
                    <div class="card__meta">
                        ${project.technologies.map(tech =>
                            `<span class="project-technology paragraph-text-normal">${tech}</span>`
                        ).join('')}
                    </div>

                </div>
            </div>
        </div>
    `
}

let selected = (slug) => {
    render_projects(slug);
}