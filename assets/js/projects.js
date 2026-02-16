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
            link: 'https://github.com/abhn/Mporter',
            title: 'Blind project',
            demo: 'https://github.com/KunsanDADLab/BlindProject/tree/main',
            technologies: ['Yolov5', 'CVAT', 'Python'],
            description: "시각장애인을 위한 보행 보조장치입니다. Yolov5를 사용하여 장애인의 주변 환경을 인식하고, 사용자에게 경고를 제공합니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/mobile-landscape.jpg',
            link: 'https://github.com/abhn/Wall-E',
            title: '태양광 기반 세종시 모기 퇴치 솔루션',
            demo: false,
            technologies: ['Yolov5', 'python','Raspberry PI'],
            description: "태양광과 Raspberry PI, Yolov5를 활용한 해충 방제 프로젝트입니다. 특정 위치에 말라리아등의 매개가 되는 모기가 다량 발생 시 이를 탐지하고 대시보드에 출력합니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/mpw.jpg',
            link: 'https://github.com/abhn/mpw',
            title: 'PE-A(Analyzer)',
            demo: 'https://github.com/ultisy/PE-A',
            technologies: ['Python', 'Qt Designer'],
            description: "프로젝트 PEA는 'PE(Portable Executable)' 파일 포맷을 분석하고 기능별로 파편화된 도구들을 통합해서 초보자도 손쉽게 사용할 수 있도록 설계했습니다.",
            categories: ['security']
        },
        {
            image: 'assets/images/raspberry-pi-monitor.png',
            link: 'https://github.com/abhn/RPi-Status-Monitor',
            title: '이커머스 데이터 기반 개인화 추천 시스템 설계 및 구현',
            demo: false,
            technologies: ['python', 'APriori', 'LTR'],
            description: "Apriori 알고리즘과 LTR(Learning to Rank)을 활용한 상품 추천 시스템을 구축했습니다.",
            categories: ['ml']
        },
        {
            image: 'assets/images/s3scan.png',
            link: 'https://github.com/abhn/S3Scan',
            title: 'S3Scan',
            demo: false,
            technologies: ['python'],
            description: "Automate crawling of a website and find publicly open S3 buckets for takeover.",
            categories: ['security']
        },
        {
            image: 'assets/images/elementary.png',
            link: 'https://github.com/abhn/Elementary',
            title: 'Elementary',
            demo: 'https://elementary-jekyll.github.io/',
            technologies: ['Jekyll', 'CSS3'],
            description: "Elementary is a zero Javascript and minimal CSS ultra lightweight Jekyll theme for those of you who love simplicity.",
            categories: ['ml']
        },
        {
            image: 'assets/images/nextcloud-enc.png',
            link: 'https://www.nagekar.com/2017/08/private-cloud-part-2.html',
            title: 'Encrypted Self-Hosted Cloud',
            demo: false,
            technologies: ['NextCloud', 'GnuPG'],
            description: "Self hosted encrypted cloud setup with Nextcloud and GnuPG.",
            categories: ['security']
        },
        {
            image: 'assets/images/google-cloud-backup.png',
            link: 'https://www.nagekar.com/2018/05/encrypted-backup-with-duplicity.html',
            title: 'Encrypted Backups - Google Cloud',
            demo: false,
            technologies: ['NextCloud', 'Duplicity'],
            description: "Create automated encrypted incremental backups of data. Sync everything securely to Google Cloud.",
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