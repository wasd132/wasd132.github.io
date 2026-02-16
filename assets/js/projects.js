$(document).ready(() => {
    render_projects('webdev');
})


let render_projects = (slug) => {
    let projects_area = $('.projects-wrapper');

    $('.white-button').removeClass('white-button-hover');
    $(`#${slug}`).addClass('white-button-hover');

    let projects_obj = [
        {
            image: 'assets/images/mentors.jpg',
            link: 'https://github.com/abhn/Mporter',
            title: 'Mporter',
            demo: 'https://mporter.co',
            technologies: ['Flask', 'Celery', 'Python'],
            description: "Flask web application for easy reporting updates to one's mentor. Multi-user support, easy to deploy and use.",
            categories: ['webdev']
        },
        {
            image: 'assets/images/mobile-landscape.jpg',
            link: 'https://github.com/abhn/Wall-E',
            title: 'Wall-E',
            demo: 'http://wall-e-jekyll.github.io/',
            technologies: ['Semantic UI', 'Jekyll'],
            description: "A modern Jekyll theme with grid frontpage, beautiful typography, mobile responsive, made with Semantic UI.",
            categories: ['webdev']
        },
        {
            image: 'assets/images/mpw.jpg',
            link: 'https://github.com/abhn/mpw',
            title: 'Master Password',
            demo: 'https://www.nagekar.com/mpw',
            technologies: ['Semantic UI', 'CSS3'],
            description: "Master Password is an ingenious password solution that makes your passwords truly impossible to lose.",
            categories: ['security']
        },
        {
            image: 'assets/images/raspberry-pi-monitor.png',
            link: 'https://github.com/abhn/RPi-Status-Monitor',
            title: 'Raspberry Pi Monitor',
            demo: false,
            technologies: ['python', 'flask'],
            description: "Web based status monitor/smart mirror, displays system stats, weather and more.",
            categories: ['webdev']
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
            categories: ['webdev']
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
        
                        <p class="paragraph-text-normal">${project.description} ${project.demo ? `<a href="${project.demo}">Demo</a>` : ''}</p>
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