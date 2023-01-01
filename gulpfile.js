import gulp from "gulp";

/*-----------ПУТИ-----------------------*/
import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());// Корневая директория
const buildFolder = `./dist`;// Конечная директория
const srcFolder = `./src`;// Исходная директория
const path = {
    pug: {
        src: [`${srcFolder}/pug/*.pug`, `!${srcFolder}/pug/_*.pug`],
        build: `${buildFolder}/`,
        watch: `${srcFolder}/**/*.pug`,
    },
    sass: {
        src: [`${srcFolder}/sass/*.scss`, `!${srcFolder}/sass/_*.scss`],
        build: `${buildFolder}/css/`,
        watch: `${srcFolder}/sass/**/*.scss`,
    },
    js: {
        src: `${srcFolder}/js/*.js`,
        build: `${buildFolder}/js/`,
        watch: `${srcFolder}/js/**/*.js`,
    },
    img: {
        src: {
            min: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif}`,
            nomin: `${srcFolder}/img/**/*.{svg,ico,webp}`,
        },
        build: `${buildFolder}/img/`,
        watch: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,svg,ico,webp}`,
    },
}
/*--------------ОСНОВЫЕ-ПЛАГИНЫ----------------------*/
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import browserSync from "browser-sync";
import newer from "gulp-newer";
import { deleteAsync } from 'del';

/*--------------ЛОКАЛЬНЫЙ-СЕРВЕР----------------------*/
const server = () => {
    browserSync.init({
        server: {
            baseDir: `${path.pug.build}`
        },
        notify: false,
    });
}

/*------------PUG---------------------------*/
import pugCompiler from 'gulp-pug';
import versionNumber from "gulp-version-number";
import htmlmin from "gulp-htmlmin";

const pug = () => {
    return gulp.src(path.pug.src)
        .pipe(plumber(notify.onError({
            title: "PUG",
            message: "Error: <%= error.message %>"
        })))
        .pipe(pugCompiler({ pretty: true, verbose: true }))
        .pipe(versionNumber({
                'value': '%DT%',
                'append': {
                    'key': '_v',
                    'cover': 0,
                    'to': [
                        'css',
                        'js',
                    ]
                },
                'output': {
                    'file': 'version.json'
                }
            })
        )
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.pug.build))
        .pipe(browserSync.stream());
}

/*------------SASS---------------------------*/
import compilerSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import groupCssMediaQueries from 'gulp-group-css-media-queries';
import shorthand from "gulp-shorthand";
import cleanCss from "gulp-clean-css";

const defaultSass = gulpSass(compilerSass);
const sass = () => {
    return gulp.src(path.sass.src, { sourcemaps: true })
        .pipe(plumber(notify.onError({
            title: "SASS",
            message: "Error: <%= error.message %>"
        })))
        .pipe(defaultSass({ outputStyle: 'expanded' }))
        .pipe(groupCssMediaQueries())
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserlist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(shorthand())
        //.pipe(gulp.dest(path.sass.build, { sourcemaps: true})) // Несжатый файл
        .pipe(cleanCss())
        .pipe(gulp.dest(path.sass.build, { sourcemaps: true}))
        .pipe(browserSync.stream());
}

/*------------JS---------------------------*/
import uglify from "gulp-uglify";

const js = () => {
    return gulp.src(path.js.src, { sourcemaps: true })
        .pipe(plumber(notify.onError({
            title: "JavaScript",
            message: "Error: <%= error.message %>"
        })))
        .pipe(newer(path.js.build))
        .pipe(uglify())
        .pipe(gulp.dest(path.js.build, { sourcemaps: true }))
        .pipe(browserSync.stream());
}

/*------------IMG---------------------------*/
import imagemin from 'gulp-imagemin';

const img = () => {
    return gulp.src(path.img.src.min)
        .pipe(plumber(notify.onError({
            title: "IMG(min)",
            message: "Error: <%= error.message %>"
        })))
        .pipe(newer(path.img.build))
        .pipe(imagemin({       // Оптимизация 
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3, // 0 to 7
        }))
        .pipe(gulp.dest(path.img.build))
        // NoMIN
        .pipe(gulp.src(path.img.src.nomin))
        .pipe(plumber(notify.onError({
            title: "IMG(nomin)",
            message: "Error: <%= error.message %>"
        })))
        .pipe(gulp.dest(path.img.build))
        .pipe(browserSync.stream());
}

/*-------------НАБЛЮДАТЕЛЬ-------------------*/
function watcher() {
    gulp.watch(path.pug.watch, pug);
    gulp.watch(path.sass.watch, sass);
    gulp.watch(path.js.watch, js);
    gulp.watch(path.img.watch, img);
}

/*-------------ОЧИСТКА-------------------*/
const reset = () => {
    return deleteAsync(buildFolder);
}

/*-------------ZIP-АРХИВ-------------------*/
import zipBuilder from 'gulp-zip';

export const zip = () => {
    deleteAsync(`./${rootFolder}.zip`)
    return gulp.src(`${buildFolder}/**/*.*`)
        .pipe(plumber(notify.onError({
            title: "ZIP",
            message: "Error: <%= error.message %>"
        })))
        .pipe(zipBuilder(`${rootFolder}.zip`))
        .pipe(gulp.dest('./'));
}

/*-------------СЦЕНАРИИ-------------------*/
const mainTasks = gulp.parallel(pug, sass, js, img);

const dev = gulp.series(
    reset,
    mainTasks,
    gulp.parallel(watcher, server)
);
const build = gulp.series(
    reset,
    mainTasks
)
const deployZIP = gulp.series(
    reset,
    mainTasks,
    zip
)

export { dev };
export { build };
export { deployZIP };

gulp.task('default', dev);
gulp.task('build', build);
gulp.task('zip', deployZIP);