import Swal from "sweetalert2"

export async function confirmMessage(text: string) {
    return await Swal.fire({
        title: 'Confirmation',
        text: text,
        icon: 'question',
        confirmButtonText: 'Yes',
        customClass: {
            container: 'my-swall-index'
        },
        cancelButtonText: 'No',
        showCancelButton: true
      }).then((res) => res.isConfirmed)
}