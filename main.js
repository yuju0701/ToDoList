// 할 일 입력 필드를 선택
let userInput = document.querySelector(".task-input");

// "추가" 버튼을 선택
let addButton = document.querySelector(".button-add");

// 모든 탭 요소를 선택
let tabs = document.querySelectorAll(".tab-type div");

// 활성 탭의 밑줄 요소를 선택
let underLine = document.getElementById("tab-underline");

// 마감일 설정을 위한 변수
let currentTaskId = null;

// 마감일 설정 모달 요소
let dueDateModal = new bootstrap.Modal(document.getElementById('dueDateModal'), {});

// 마감일 입력 필드와 저장 버튼
let dueDateInput = document.getElementById('dueDateInput');
let saveDueDateButton = document.getElementById('saveDueDate');

// 알림 시간 설정 모달 요소
let reminderModal = new bootstrap.Modal(document.getElementById('reminderModal'), {});

// 알림 시간 입력 필드와 저장 버튼
let reminderInput = document.getElementById('reminderInput');
let saveReminderButton = document.getElementById('saveReminder');

// 알림 소리 요소
let alertSound = document.getElementById('alertSound');

// 알림 시간 설정을 위한 변수
let currentTaskReminderId = null;

// 예약된 알림을 추적하는 변수
let scheduledReminders = {};

// 할 일 목록을 저장할 배열 초기화
let taskList = [];

// 초기 필터 모드를 "all"로 설정
let mode = "all";

// 필터된 할 일 목록을 저장할 배열 초기화
let filterList = [];

// 초기화 함수
function initialize() {
  // "추가" 버튼에 마우스 다운 이벤트 리스너 추가
  addButton.addEventListener("mousedown", addTask);

  // 지우기 버튼 클릭 이벤트 리스너 추가(알림)
  document.getElementById('clearReminder').addEventListener('click', function() {
    reminderInput.value = '';
  });

  // 지우기 버튼 클릭 이벤트 리스너 추가 (마감일)
  document.getElementById('clearDueDate').addEventListener('click', function() {
    dueDateInput.value = '';
  });

  // 엔터 키를 눌렀을 때 할 일을 추가하는 이벤트 리스너 추가
  userInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      addTask(event);
    }
  });

  // 각 탭에 클릭 이벤트 리스너 추가
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function (event) {
      filter(event);
    });
  }

  // 마감일 저장 버튼 클릭 이벤트 리스너
  saveDueDateButton.addEventListener("click", function () {
    saveDueDate();
  });

  // 알림 시간 저장 버튼 클릭 이벤트 리스너
  saveReminderButton.addEventListener("click", function () {
    saveReminder();
  });

  // 기존 알림 예약 초기화
  initializeReminders();
}

// 할 일을 추가하는 함수
function addTask() {
  // 입력 필드의 값을 가져옴
  let taskValue = userInput.value;

  // 입력 값이 비어있으면 경고 메시지 표시
  if (taskValue === "") return alert("할일을 입력해주세요");

  // 새로운 할 일 객체 생성
  let task = {
    content: taskValue,
    isComplete: false,
    isPriority: false,
    id: randomIDGenerator(),
  };

  // 할 일 목록에 추가
  taskList.push(task);

  // 입력 필드 초기화
  userInput.value = "";

  // 할 일 목록을 다시 렌더링
  render();
}

// 할 일 목록을 렌더링하는 함수
function render() {
  let result = "";
  let list = [];

  // 현재 모드에 따라 렌더링할 목록 설정
  if (mode === "all") {
    list = taskList;
  } else {
    list = filterList;
  }

  // 목록을 순회하며 HTML 생성
  for (let i = 0; i < list.length; i++) {
    let starClass = list[i].isPriority ? 'fas fa-star' : 'far fa-star';
    let bellClass = list[i].isReminderSet ? 'fas fa-bell' : 'far fa-bell';
    let dueDateText = list[i].dueDate ? ` (마감일: ${list[i].dueDate})` : '';      
    if (list[i].isComplete) {
      result += `<div class="task task-done" id="${list[i].id}">
            <span>${list[i].content}</span>
            <div class="button-box">
              <button onclick="toggleDone('${list[i].id}')"><i class="fas fa-redo"></i></button>
              <button onclick="togglePriority('${list[i].id}')"><i class="${starClass}"></i></button>
              <button onclick="editTask('${list[i].id}')"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="openDueDateModal('${list[i].id}')"><i class="fa fa-calendar-alt"></i></button>
              <button onclick="openReminderModal('${list[i].id}')"><i class="fa fa-bell"></i></button>
              <button onclick="deleteTask('${list[i].id}')"><i class="fa-solid fa-trash-arrow-up"></i></button>
            </div>
        </div>`;
    } else {
      result += `<div class="task" id="${list[i].id}" >
            <span>${list[i].content}</span>
            <div class="button-box">
              <button onclick="toggleDone('${list[i].id}')"><i class="fa-solid fa-check"></i></button>
              <button onclick="togglePriority('${list[i].id}')"><i class="${starClass}"></i></button>
              <button onclick="editTask('${list[i].id}')"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="openDueDateModal('${list[i].id}')"><i class="fa fa-calendar-alt"></i></button>
              <button onclick="openReminderModal('${list[i].id}')"><i class="fa fa-bell"></i></button>
              <button onclick="deleteTask('${list[i].id}')"><i class="fa-solid fa-trash-arrow-up"></i></button>
            </div>
        </div>`;
    }
  }

  // HTML을 task-board 요소에 삽입
  document.getElementById("task-board").innerHTML = result;
}

// 할 일 완료 상태를 토글하는 함수
function toggleDone(id) {
  // 할 일 목록을 순회하며 ID가 일치하는 할 일의 완료 상태를 토글
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === id) {
      taskList[i].isComplete = !taskList[i].isComplete;
      break;
    }
  }

  // 필터링된 목록을 다시 렌더링
  filter();
}

// 할 일을 삭제하는 함수
function deleteTask(id) {
  // 할 일 목록을 순회하며 ID가 일치하는 할 일을 삭제
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === id) {
      // 예약된 알림 취소
      if (scheduledReminders[id]) {
        clearTimeout(scheduledReminders[id]);
        delete scheduledReminders[id];
      }
      taskList.splice(i, 1);
      break;
    }
  }

  // 필터링된 목록을 다시 렌더링
  filter();
}

// 중요도 토글 함수
function togglePriority(id) {
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === id) {
      taskList[i].isPriority = !taskList[i].isPriority;
      break;
    }
  }
  render();
}

// 편집 함수
function editTask(id) {
  let newContent = prompt("수정할 내용을 입력하세요:");
  if (newContent) {
    for (let i = 0; i < taskList.length; i++) {
      if (taskList[i].id === id) {
        taskList[i].content = newContent;
        break;
      }
    }
    render();
  }
}

// 마감일 모달을 여는 함수
function openDueDateModal(id) {
  currentTaskId = id;
  let task = taskList.find(task => task.id === id);
  dueDateInput.value = task.dueDate || "";
  dueDateModal.show();
}

// 마감일을 저장하는 함수
function saveDueDate() {
  if (currentTaskId) {
    let task = taskList.find(task => task.id === currentTaskId);
    task.dueDate = dueDateInput.value;
    render();
    dueDateModal.hide();
  }
}

// 알림 시간 모달을 여는 함수
function openReminderModal(id) {
  currentTaskReminderId = id;
  let task = taskList.find(task => task.id === id);
  reminderInput.value = task.reminder || "";
  reminderModal.show();
}

// 알림 시간을 저장하는 함수
function saveReminder() {
  if (currentTaskReminderId) {
    let task = taskList.find(task => task.id === currentTaskReminderId);
    let reminder = reminderInput.value;

    // 날짜 및 시간 형식 유효성 검사 또는 빈 값 허용
    if (reminder === '' || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(reminder)) {
      task.reminder = reminder;
      if (reminder) {
        scheduleReminder(task);
      } else {
        // 알림이 빈 값이면 예약 취소
        if (scheduledReminders[task.id]) {
          clearTimeout(scheduledReminders[task.id]);
          delete scheduledReminders[task.id];
        }
      }
      render();
      reminderModal.hide();
    } else {
      alert("날짜 및 시간 형식이 올바르지 않습니다. (YYYY-MM-DDTHH:MM)");
    }
  }
}

// 알림을 예약하는 함수
function scheduleReminder(task) {
  let reminderTime = new Date(task.reminder).getTime();
  let currentTime = new Date().getTime();
  let timeDifference = reminderTime - currentTime;

  if (scheduledReminders[task.id]) {
    clearTimeout(scheduledReminders[task.id]);
  }

  if (timeDifference > 0) {
    scheduledReminders[task.id] = setTimeout(function () {
      alertSound.play(); // 알림 소리 재생
      alert(`알림: ${task.content}`);
    }, timeDifference);
  }
}

// 페이지 로드 시 기존 알림을 예약하는 함수
function initializeReminders() {
  for (let task of taskList) {
    if (task.reminder) {
      scheduleReminder(task);
    }
  }
}

// 필터링하는 함수
function filter(e) {
  // 이벤트가 발생하면 모드 설정 및 밑줄 위치 조정
  if (e) {
    mode = e.target.id;
    underLine.style.width = e.target.offsetWidth + "px";
    underLine.style.left = e.target.offsetLeft + "px";
    underLine.style.top = e.target.offsetTop + (e.target.offsetHeight - 4) + "px";
  } 

  // 필터 목록 초기화
  filterList = [];

  // 모드에 따라 필터링된 목록 설정
  if (mode === "ongoing") {
    for (let i = 0; i < taskList.length; i++) {
      if (taskList[i].isComplete == false) {
        filterList.push(taskList[i]);
      }
    }
  } else if (mode === "done") {
    for (let i = 0; i < taskList.length; i++) {
      if (taskList[i].isComplete) {
        filterList.push(taskList[i]);
      }
    }
  }

  // 목록을 다시 렌더링
  render();
}

// 랜덤한 ID를 생성하는 함수
function randomIDGenerator() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// 초기화 함수 호출
initialize();