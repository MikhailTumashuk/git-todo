var maxLength
var CKEditorStats

function setCKEditorMaxLength(maxLength) {
    this.maxLength = maxLength
}

BalloonEditor
.create(document.querySelector('.editor'), {
    licenseKey: '',
    // убрать тул бар
    toolbar: [],
        wordCount: {
            onUpdate: stats => {
                // var inputLength = stats.characters;
                // var str = input_to_do.innerText;
                // var spacesCount = inputLength - str.replace(/\s+/g, '').length;
                // isLimitExceeded = (inputLength - spacesCount) > maxLength;
                CKEditorStats = stats

                // enter_btn.toggleAttribute('disabled', isLimitExceeded);

                // var editor = document.querySelector(".editor__editable, main .ck-editor[role='application'] .ck.ck-content, .ck.editor__editable[role='textbox'], .ck.ck-editor__editable[role='textbox'], .ck.editor[role='textbox']")
                // if (isLimitExceeded) {
                //     editor.classList.add('overflow');
                // } else {
                //     editor.classList.remove('overflow');
                // }
                // // editor drops our class on blur so we get it back
                // editor.onblur = () => {
                //     setTimeout(() => {
                //         if (isLimitExceeded) {
                //             editor.classList.add('overflow');
                //         }
                //     }, 10);
                // }
                // editor.onclick = () => {
                //     if (isLimitExceeded) {
                //         editor.classList.add('overflow');
                //     }
                // }
            }
        }
    })
    .then(editor => {
        window.editor = editor;
    })
    .catch(error => {
        console.error('Oops, something went wrong!');
        console.error(
            'Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:'
        );
        console.warn('Build id: 8qukhag3raeq-qnuer1ao5sd0');
        console.error(error);
    });