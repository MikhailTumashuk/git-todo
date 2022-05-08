
var maxLength

function setCKEditorMaxLength(maxLength) {
    this.maxLength = maxLength
}

BalloonEditor
.create(document.querySelector('.editor'), {
    licenseKey: '',
    // убрать тул бар
    toolbar: [],
    wordCount: {
        // ограничим ввод
        onUpdate: stats => {
            var inputLength = stats.characters;
            isLimitExceeded = inputLength > maxLength;
            enter_btn.toggleAttribute( 'disabled', isLimitExceeded );
            if (isLimitExceeded)
                input_to_do.style.background = 'lightcoral'
            else
                input_to_do.style.background = 'white'
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